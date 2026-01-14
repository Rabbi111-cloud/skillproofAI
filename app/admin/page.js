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

  useEffect(() => {
    async function loadAdmin() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError

        const user = authData?.user
        if (!user) {
          router.replace('/')
          return
        }

        if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          router.replace('/dashboard')
          return
        }

        // Fetch profiles safely
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, email, score, breakdown')
          .order('updated_at', { ascending: false })

        if (profilesError) throw profilesError

        const safeProfiles = (data || []).map(p => ({
          user_id: p?.user_id ?? null,
          email: p?.email ?? 'Unknown',
          score: typeof p?.score === 'number' ? p.score : Number(p?.score) || null,
          breakdown: p?.breakdown ?? {}
        }))

        setProfiles(safeProfiles)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadAdmin()
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading admin dashboard…</p>
  if (error) return <p style={{ padding: 40, color: 'red' }}>{error}</p>

  return (
    <main style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>

      {profiles.length === 0 ? (
        <p>No candidates yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Score</th>
              <th>Level</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => {
              const score = p.score ?? 0
              let level = 'Average'
              if (score >= 90) level = 'Excellent'
              else if (score >= 80) level = 'Strong'

              return (
                <tr key={p.user_id || p.email}>
                  <td>{p.email}</td>
                  <td>{p.score ?? '—'}</td>
                  <td>{level}</td>
                  <td>
                    {p.user_id ? (
                      <a href={`/p/${p.user_id}`} target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : (
                      'Unavailable'
                    )}
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
