'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyDashboard() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true)
        setError('')

        // Fetch all candidate profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')

        if (error) throw error

        setCandidates(data)
      } catch (err) {
        console.error('COMPANY DASHBOARD ERROR:', err)
        setError('Failed to load candidates')
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [])

  if (loading) return <p style={{ padding: 30 }}>Loading candidates...</p>
  if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Dashboard</h1>
      {candidates.length === 0 ? (
        <p>No candidates found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Score</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Level</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Profile</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => {
              let level = 'Unknown'
              if (candidate.score >= 80) level = 'Excellent'
              else if (candidate.score >= 60) level = 'Good'
              else if (candidate.score >= 40) level = 'Average'
              else level = 'Very Bad'

              return (
                <tr key={candidate.user_id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{candidate.email}</td>
                  <td style={{ padding: 8 }}>{candidate.score}%</td>
                  <td style={{ padding: 8 }}>{level}</td>
                  <td style={{ padding: 8 }}>
                    <a
                      href={`/p/${candidate.user_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'blue' }}
                    >
                      View Profile
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
