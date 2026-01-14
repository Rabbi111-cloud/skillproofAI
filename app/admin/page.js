'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfiles() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, score, breakdown, updated_at')
          .order('score', { ascending: false })

        if (error) throw error
        setProfiles(data || [])
      } catch (err) {
        console.error(err)
        setError('Error loading admin dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadProfiles()
  }, [])

  if (loading) return <p style={{ padding: 30 }}>Loading admin dashboard...</p>
  if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>

  return (
    <main style={{ padding: 40 }}>
      <h2>Admin Dashboard</h2>

      {profiles.length === 0 ? (
        <p>No candidates yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Score</th>
              <th>Level</th>
              <th>Skill Breakdown</th>
              <th>Profile Link</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              let level = 'Average'
              if (profile.score >= 80) level = 'Strong'
              if (profile.score >= 90) level = 'Excellent'

              return (
                <tr key={profile.user_id}>
                  <td>{profile.email}</td>
                  <td>{profile.score}</td>
                  <td>{level}</td>
                  <td>
                    {profile.breakdown
                      ? <pre>{JSON.stringify(profile.breakdown, null, 2)}</pre>
                      : 'N/A'}
                  </td>
                  <td>
                    <a href={`/p/${profile.user_id}`} target="_blank" rel="noreferrer">
                      View Profile
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </main>
  )
}
