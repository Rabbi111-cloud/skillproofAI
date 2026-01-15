'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function AdminDashboard() {
  const [emailInput, setEmailInput] = useState('')
  const [isAllowed, setIsAllowed] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAdminAccess(e) {
    e.preventDefault()
    setError('')
    setProfiles([])

    if (!emailInput) {
      setError('Please enter admin email.')
      return
    }

    if (emailInput.toLowerCase() !== ADMIN_EMAIL) {
      setError('Access denied. Invalid admin email.')
      return
    }

    setIsAllowed(true)
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'user_id, email, score, breakdown, assessment_completed'
        )
        .eq('role', 'candidate')
        .order('score', { ascending: false })

      if (error) throw error

      setProfiles(data || [])
    } catch (err) {
      console.error('ADMIN FETCH ERROR:', err)
      setError(
        err.message || 'Failed to load admin dashboard data'
      )
    } finally {
      setLoading(false)
    }
  }

  /* ===================== LOGIN SCREEN ===================== */
  if (!isAllowed) {
    return (
      <main style={{ padding: 40, maxWidth: 500, margin: '0 auto' }}>
        <h2>Admin Access</h2>

        {error && (
          <p style={{ color: 'red', marginBottom: 10 }}>{error}</p>
        )}

        <form
          onSubmit={handleAdminAccess}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            type="email"
            placeholder="Admin email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            required
            style={{
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ccc'
            }}
          />

          <button
            type="submit"
            style={{
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Enter Admin Dashboard
          </button>
        </form>
      </main>
    )
  }

  /* ===================== DASHBOARD ===================== */
  return (
    <main style={{ padding: 40 }}>
      <h2>Admin Dashboard</h2>

      {loading && <p>Loading candidates…</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && profiles.length === 0 && (
        <p>No candidates found.</p>
      )}

      {!loading && profiles.length > 0 && (
        <table
          border="1"
          cellPadding="10"
          style={{
            marginTop: 20,
            borderCollapse: 'collapse',
            width: '100%'
          }}
        >
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th>Email</th>
              <th>Score</th>
              <th>Skill Breakdown</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.user_id}>
                <td>{profile.email}</td>
                <td>{profile.score ?? 'N/A'}</td>
                <td>
                  {profile.breakdown ? (
                    <pre
                      style={{
                        maxWidth: 350,
                        overflowX: 'auto'
                      }}
                    >
                      {JSON.stringify(
                        profile.breakdown,
                        null,
                        2
                      )}
                    </pre>
                  ) : (
                    'No breakdown'
                  )}
                </td>
                <td>
                  <a
                    href={`/p/${profile.user_id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
