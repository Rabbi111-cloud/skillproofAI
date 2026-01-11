'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyDashboard() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [minScore, setMinScore] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 6

  // Fetch candidates
  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true)
        setError('')

     const { data, error } = await supabase
          .from('profiles')
          .select('*')

        if (error) throw error
        setCandidates(data || [])
      } catch (err) {
        console.error('COMPANY DASHBOARD ERROR:', err)
        setError('Failed to load candidates')
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [])

  // Filter and sort
  const filteredCandidates = candidates
    .filter(c => {
      if (searchEmail && !c.email.toLowerCase().includes(searchEmail.toLowerCase())) return false
      if (minScore && c.score < parseInt(minScore)) return false
      return true
    })
    .sort((a, b) => b.score - a.score) // Sort descending by score

  const totalPages = Math.ceil(filteredCandidates.length / PAGE_SIZE)
  const paginatedCandidates = filteredCandidates.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  const downloadPDF = user_id => {
    window.open(`/p/${user_id}`, '_blank')
  }

  if (loading) return <p style={{ padding: 30 }}>Loading candidates...</p>
  if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Dashboard</h1>

      {/* Search & Filter */}
      <div style={{ margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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

            // Filter out invalid skills
            const skills = {}
            if (candidate.skills && typeof candidate.skills === 'object') {
              Object.keys(candidate.skills)
                .filter(skill => skill && skill !== 'undefined' && skill !== 'General')
                .forEach(skill => {
                  skills[skill] = candidate.skills[skill]
                })
            }

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
                <p style={{ margin: '0 0 5px 0' }}>
                  <strong>Score:</strong> {candidate.score}%
                </p>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>Level:</strong> {level}
                </p>

                {Object.keys(skills).length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <strong>Skills:</strong>
                    <ul style={{ paddingLeft: 20, margin: '5px 0' }}>
                      {Object.keys(skills).map(skill => (
                        <li key={skill}>
                          {skill}: {skills[skill]}%
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href={`/p/${candidate.user_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#0070f3',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: 4
                    }}
                  >
                    View Profile
                  </a>
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
          <span>Page {page} of {totalPages}</span>
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
