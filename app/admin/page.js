'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// 🔐 HARD-CODED ADMIN CREDENTIALS
const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'
const ADMIN_PASSWORD = 'supersecret' // optional password check

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch candidate profiles after successful login
  const loadProfiles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, score, breakdown, updated_at')
        .order('score', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      console.error('Error fetching candidates:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    if (loginEmail.toLowerCase() !== ADMIN_EMAIL) {
      setLoginError('Invalid admin credentials.')
      return
    }

    if (ADMIN_PASSWORD && loginPassword !== ADMIN_PASSWORD) {
      setLoginError('Invalid admin credentials.')
      return
    }

    setLoggedIn(true)
    loadProfiles()
  }

  if (!loggedIn) {
    // Show login form
    return (
      <main style={{ padding: 40, maxWidth: 500, margin: '0 auto' }}>
        <h2>Admin Login</h2>
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: 15 }}
        >
          <input
            type="email"
            placeholder="Admin Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
          />
          {ADMIN_PASSWORD && (
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              style={{
                padding: 12,
                borderRadius: 8,
                border: '1px solid #ccc'
              }}
            />
          )}
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
            Login
          </button>
        </form>
      </main>
    )
  }

  // Admin dashboard view
  return (
    <main style={{ padding: 40 }}>
      <h2>Admin Dashboard</h2>

      {loading && <p>Loading candidate profiles...</p>}

      {!loading && profiles.length === 0 && <p>No candidates yet.</p>}

      {!loading && profiles.length > 0 && (
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
                  <td>{profile.score ?? 'N/A'}</td>
                  <td>{level}</td>
                  <td>
                    {profile.breakdown
                      ? <pre>{JSON.stringify(profile.breakdown, null, 2)}</pre>
                      : 'N/A'}
                  </td>
                  <td>
                    <a
                      href={`/p/${profile.user_id}`}
                      target="_blank"
                      rel="noreferrer"
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
    </main>
  )
}
