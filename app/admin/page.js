'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function AdminDashboard() {
  const router = useRouter()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAdmin() {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user) {
        router.replace('/')
        return
      }

      if (authData.user.email !== ADMIN_EMAIL) {
        router.replace('/dashboard')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('user_id, email, score')
        .order('updated_at', { ascending: false })

      // 🚨 ABSOLUTE SAFETY FILTER
      const safe = (data || []).map(p => ({
        user_id: p?.user_id ?? '',
        email: p?.email ?? 'Unknown',
        score:
          typeof p?.score === 'number'
            ? p.score
            : Number(p?.score) || null
      }))

      setProfiles(safe)
      setLoading(false)
    }

    loadAdmin()
  }, [router])

  if (loading) {
    return <p style={{ padding: 40 }}>Loading admin dashboard…</p>
  }

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
              let level = 'N/A'
              if (typeof p.score === 'number') {
                if (p.score >= 90) level = 'Excellent'
                else if (p.score >= 80) level = 'Strong'
                else level = 'Average'
              }

              return (
                <tr key={p.user_id || p.email}>
                  <td>{p.email}</td>
                  <td>{p.score ?? '—'}</td>
                  <td>{level}</td>
                  <td>
                    {p.user_id ? (
                      <a
                        href={`/p/${p.user_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
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
