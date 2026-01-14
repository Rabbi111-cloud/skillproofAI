'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [needLogin, setNeedLogin] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      setLoading(true)
      setError('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData?.session?.user

        if (!user) {
          // no session -> show admin login form
          setNeedLogin(true)
          return
        }

        if (user.email !== ADMIN_EMAIL) {
          setError('Access denied. Not an admin.')
          return
        }

        // fetch candidates with completed assessment
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, score, breakdown, assessment_completed')
          .eq('role', 'candidate')
          .eq('assessment_completed', true)
          .order('score', { ascending: false })

        if (error) throw error
        setProfiles(data || [])
      } catch (err) {
        setError(err.message || 'Error loading admin dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  async function handleAdminLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (adminEmail !== ADMIN_EMAIL) {
        setError('Invalid admin email')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      })

      if (error) throw error

      // reload page to fetch candidates
      window.location.reload()
    } catch (err) {
      setError(err.message || 'Invalid admin credentials')
      setLoading(false)
    }
  }

  if (loading) return <p style={{ padding: 40 }}>Loading admin dashboard...</p>

  if (needLogin) {
    return (
      <main style={{ padding: 40 }}>
        <h2>Admin Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
          <input
            type="email"
            placeholder="Admin Email"
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            style={{
              padding: 10,
              borderRadius: 6,
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

  if (error)
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.push('/')} style={{ padding: 10, borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none' }}>
          Go Home
        </button>
      </div>
    )

  return (
    <main style={{ padding: 40 }}>
      <h2>Admin Dashboard</h2>

      {profiles.length === 0 ? (
        <p>No candidates have completed assessments yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: 20, borderCollapse: 'collapse', width: '100%' }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th>Email</th>
              <th>Score</th>
              <th>Skill Breakdown</th>
              <th>Level</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => {
              let level = 'Average'
              if (profile.score >= 80) level = 'Strong'
              if (profile.score >= 90) level = 'Excellent'

              return (
                <tr key={profile.user_id}>
                  <td>{profile.email}</td>
                  <td>{profile.score}</td>
                  <td>
                    {profile.breakdown
                      ? <pre style={{ maxWidth: 300, overflowX: 'auto' }}>{JSON.stringify(profile.breakdown, null, 2)}</pre>
                      : 'N/A'}
                  </td>
                  <td>{level}</td>
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
