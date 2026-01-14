'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function AdminDashboard() {
  const router = useRouter()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadAdmin() {
      try {
        const res = await supabase.auth.getUser()

        if (!res?.data?.user) {
          router.replace('/')
          return
        }

        const user = res.data.user

        if (user.email !== ADMIN_EMAIL) {
          router.replace('/dashboard')
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, email, score, updated_at')
          .order('updated_at', { ascending: false })

        if (error) throw error

        // 🔐 FILTER BAD ROWS (CRITICAL FIX)
        const safeProfiles = (data || []).filter(
          p => p?.user_id && p?.email
        )

        setProfiles(safeProfiles)
      } catch (err) {
        console.error(err)
        setError('Failed to load admin dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadAdmin()
  }, [router])

  if (loading) {
    return <p style={{ padding: 40 }}>Loading admin dashboard…</p>
  }

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.replace('/')}>Go Home</button>
      </div>
    )
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>

      {profiles.length === 0 ? (
        <p>No valid candidate profiles yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Score</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.user_id}>
                <td>{p.email}</td>
                <td>{p.score ?? 'N/A'}</td>
                <td>
                  <a
                    href={`/p/${p.user_id}`}
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
