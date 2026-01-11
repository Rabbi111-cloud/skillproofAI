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

  /* =====================================================
     1️⃣ COMPANY AUTH + ROLE GUARD
  ===================================================== */
  useEffect(() => {
    async function checkCompany() {
      setLoading(true)

      const { data: auth, error } = await supabase.auth.getUser()

      if (error || !auth?.user) {
        router.push('/company/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('user_id', auth.user.id)
        .single()

      if (profileError || !profile || profile.role !== 'company') {
        await supabase.auth.signOut()
        alert('Access denied: Not a company account')
        router.push('/company/login')
        return
      }

      setUser({ ...auth.user, company_id: profile.company_id || null })
      setLoading(false)
    }

    checkCompany()
  }, [router])

  /* =====================================================
     2️⃣ FETCH ALL CANDIDATES
  ===================================================== */
  useEffect(() => {
    async function fetchCandidates() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .is('company_id', null) // candidates only

        if (error) throw error
        setCandidates(data || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load candidates')
      }
    }

    fetchCandidates()
  }, [])

  if (loading) return <p style={{ padding: 30 }}>Loading...</p>
  if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>
  if (!user) return null

  /* =====================================================
     3️⃣ FILTER + PAGINATION
  ===================================================== */
  const filteredCandidates = candidates
    .filter(c =>
      !searchEmail ||
      (c.email && c.email.toLowerCase().includes(searchEmail.toLowerCase()))
    )
    .filter(c => !minScore || c.score >= Number(minScore))
    .sort((a, b) => (b.score || 0) - (a.score || 0))

  const totalPages = Math.ceil(filteredCandidates.length / PAGE_SIZE)
  const paginatedCandidates = filteredCandidates.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  const downloadPDF = userId => {
    window.open(`/p/${userId}`, '_blank')
  }

  /* =====================================================
     4️⃣ UI
  ===================================================== */
  return (
    <div style={{ padding: 30 }}>
      <h1>Company Dashboard</h1>

      {/* Search & Filter */}
      <div style={{ margin: '20px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
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

            const skills = {}
            if (candidate.skills && typeof candidate.skills === 'object') {
              Object.keys(candidate.skills)
                .filter(
                  s => s && s !== 'undefined' && s !== 'General'
                )
                .forEach(s => (skills[s] = candidate.skills[s]))
            }

            return (
              <div
                key={candidate.user_id}
                style={{
                  padding: 15,
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  background: '#fff'
                }}
              >
                <h3>{candidate.email}</h3>
                <p><strong>Score:</strong> {candidate.score || 0}%</p>
                <p><strong>Level:</strong> {level}</p>

                {Object.keys(skills).length > 0 && (
                  <ul>
                    {Object.keys(skills).map(skill => (
                      <li key={skill}>{skill}: {skills[skill]}%</li>
                    ))}
                  </ul>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href={`/p/${candidate.user_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 10px',
                      background: '#0070f3',
                      color: '#fff',
                      borderRadius: 4,
                      textDecoration: 'none'
                    }}
                  >
                    View Profile
                  </a>

                  <button
                    onClick={() => downloadPDF(candidate.user_id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #0070f3',
                      background: '#fff',
                      cursor: 'pointer'
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
        <div style={{ marginTop: 30 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>

          <span style={{ margin: '0 10px' }}>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
