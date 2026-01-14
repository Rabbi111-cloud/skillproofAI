'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

// 🔐 ADMIN EMAIL (CHANGE THIS)
const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadProfiles() {
      setLoading(true)
      setError('')
      try {
        // 1️⃣ Ensure user is logged in
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError

        if (!authData?.user) {
          setError('You must be logged in as admin.')
          return
        }

        // 2️⃣ BLOCK NON-ADMIN USERS
        if (authData.user.email !== ADMIN_EMAIL) {
          setError('Access denied. Not an admin.')
          return
        }

        // 3️⃣ Fetch candidates who completed assessment
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, score, breakdown, assessment_completed, updated_at')
          .eq('role', 'candidate')
          .eq('assessment_completed', true)
          .order('score', { ascending: false })

        if (error) throw error

        setProfiles(data || [])
      } catch (err) {
        console.error('Error loading Admin Dashboard:', err)
        setError(err.message || 'Error loading Admin Dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadProfiles()
  }, [])

  if (loading) return <p style={{ padding: 40 }}>Loading admin dashboard...</p>

  if (error)
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'red', marginBottom: 20 }}>{error}</p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
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
        <table
          border="1"
          cellPadding="10"
          style={{ marginTop: 20, borderCollapse: 'collapse', width: '100%' }}
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
                  <td>{profile.score}</td>
                  <td>
                    {profile.breakdown
                      ? <pre style={{ maxWidth: 300, overflowX: 'auto' }}>{JSON.stringify(profile.breakdown, null, 2)}</pre>
                      : 'N/A'}
                  </td>
                  <td>{level}</td>
                  <td>
                    <a
                      href={`/p/${profile.user_id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'underline' }}
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
