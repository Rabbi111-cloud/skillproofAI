'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function AdminDashboard() {
  const router = useRouter()

  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [needLogin, setNeedLogin] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // ================= LOAD DASHBOARD =================
  async function loadAdminDashboard() {
    try {
      setLoading(true)
      setError('')

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) throw sessionError

      const user = sessionData?.session?.user

      if (!user) {
        setNeedLogin(true)
        setLoading(false)
        return
      }

      if (user.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut()
        setError('Access denied. Not an admin.')
        setNeedLogin(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, score, breakdown, assessment_completed')
        .eq('role', 'candidate')
        .eq('assessment_completed', true)
        .order('score', { ascending: false })

      if (error) throw error

      setProfiles(data || [])
      setNeedLogin(false)
    } catch (err) {
      console.error('ADMIN ERROR:', err)
      setError(err.message || 'Error loading admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  // ================= INITIAL LOAD =================
  useEffect(() => {
    loadAdminDashboard()
  }, [])

  // ================= ADMIN LOGIN =================
  async function handleAdminLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut()
        throw new Error('Access denied. Not an admin.')
      }

      await loadAdminDashboard()
    } catch (err) {
      setError(err.message || 'Invalid login credentials')
      setLoading(false)
    }
  }

  // ================= LOADING =================
  if (loading) {
    return <p style={{ padding: 40 }}>Loading admin dashboard...</p>
  }

  // ================= LOGIN SCREEN =================
  if (needLogin) {
    return (
      <main style={{ padding: 40, maxWidth: 400 }}>
        <h2>Admin Login</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form
          onSubmit={handleAdminLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />

          <button
            type="submit"
            style={{
              padding: 10,
              borderRadius: 6,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>
      </main>
    )
  }

  // ================= ERROR STATE =================
  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: 10,
            borderRadius: 6,
            background: '#2563eb',
            color: '#fff',
            border: 'none'
          }}
        >
          Go Home
        </button>
      </div>
    )
  }

  // ================= DASHBOARD =================
  return (
    <main style={{ padding: 40 }}>
      <h2>Admin Dashboard</h2>

      {profiles.length === 0 ? (
        <p>No candidates have completed assessments yet.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ marginTop: 20, width: '100%', borderCollapse: 'collapse' }}
        >
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
                  <td>{profile.score}%</td>
                  <td>
                    {profile.breakdown ? (
                      <pre style={{ maxWidth: 300, overflowX: 'auto' }}>
                        {JSON.stringify(profile.breakdown, null, 2)}
                      </pre>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{level}</td>
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
