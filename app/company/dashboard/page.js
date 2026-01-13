'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

const PAGE_SIZE = 6

export default function CompanyDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [searchEmail, setSearchEmail] = useState('')
  const [minScore, setMinScore] = useState('')
  const [page, setPage] = useState(1)

  // 1️⃣ Check logged-in company
  useEffect(() => {
    async function checkUser() {
      setLoading(true)
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/company/login')
        return
      }

      // Fetch company profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'company') {
        await supabase.auth.signOut()
        router.push('/company/login')
        return
      }

      setUser({ ...user, company_id: profile.company_id })
    }
    checkUser()
  }, [router])

  // 2️⃣ Fetch candidates
  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .is('company_id', null) // only candidates
          .not('role', 'eq', 'company') // exclude company accounts

        if (error) throw error
        setCandidates(data || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load candidates')
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [])

  if (loading) return <p style={{ padding: 30 }}>Loading...</p>
  if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>
  if (!user) return null

  // 3️⃣ Filtering & Pagination
  const filteredCandidates = candidates
    .filter(c =>
      !searchEmail || c.email.toLowerCase().includes(searchEmail.toLowerCase())
    )
    .filter(c => !minScore || c.score >= parseInt(minScore))
    .sort((a, b) => b.score - a.score)

  const totalPages = Math.ceil(filteredCandidates.length / PAGE_SIZE)
  const paginatedCandidates = filteredCandidates.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  // 4️⃣ View Profile
  const viewProfile = candidateId => router.push(`/p/${candidateId}`)

  // 5️⃣ Download PDF
  const downloadPDF = candidateId => window.open(`/p/${candidateId}`, '_blank')

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Dashboard</h1>

      {/* Search & Filter */}
      <div
        style={{
          margin: '20px 0',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        <input
          type="text"
          placeholder="Search by email"
          value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)}
          style={{ padding: 6, flex: '1 1 200px' }}
        />
        <input
          type="number"
          placeholder="Min score"
          value={minScore}
          onChange={e => setMinScore(e.target.value)}
          style={{ padding: 6, width: 120 }}
        />
      </div>

      {paginatedCandidates.length === 0 ? (
        <p>No candidates found.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 20
          }}
        >
          {paginatedCandidates.map(candidate => {
            const level =
              candidate.score >= 80
                ? 'Excellent'
                : candidate.score >= 60
                ? 'Good'
                : candidate.score >= 40
                ? 'Average'
                : 'Very Bad'

            return (
              <div
                key={candidate.user_id}
                style={{
                  padding: 15,
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{candidate.email}</h3>
                <p>
                  <strong>Score:</strong> {candidate.score}%
                </p>
                <p>
                  <strong>Level:</strong> {level}
                </p>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => viewProfile(candidate.user_id)}
                    style={{
                      padding: '6px 10px',
                      cursor: 'pointer',
                      borderRadius: 4,
                      border: '1px solid #0070f3',
                      backgroundColor: '#0070f3',
                      color: '#fff'
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => downloadPDF(candidate.user_id)}
                    style={{
                      padding: '6px 10px',
                      cursor: 'pointer',
                      borderRadius: 4,
                      border: '1px solid #0070f3',
                      backgroundColor: '#fff',
                      color: '#0070f3'
                    }}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: 30,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
