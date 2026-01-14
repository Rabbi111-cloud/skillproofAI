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
        // 1️⃣ Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw new Error('Supabase session error: ' + sessionError.message)

        const user = sessionData?.session?.user
        if (!user) {
          setError('No active session. Please log in.')
          console.error('No session:', sessionData)
          router.replace('/') // redirect to login/home
          return
        }

        // 2️⃣ Check admin email
        if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          setError('Access denied: Not an admin.')
          console.error('Non-admin attempted access:', user.email)
          router.replace('/dashboard')
          return
        }

        // 3️⃣ Fetch all candidate profiles
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, email, score, breakdown')
          .order('updated_at', { ascending: false })

        if (profilesError) throw new Error('Profiles fetch error: ' + profilesError.message)

        // 4️⃣ Defensive mapping
        const safeProfiles = (data || []).map(p => ({
          user_id: p?.user_id ?? null,
          email: p?.email ?? 'Unknown',
          score: typeof p?.score === 'number' ? p.score : Number(p?.score) || null,
          breakdown: p?.breakdown ?? {}
        }))

        setProfiles(safeProfiles)
      } catch (err) {
        console.error('AdminDashboard error:', err)
        setError(err.message || 'Unknown client-side error')
      } finally {
        setLoading(false)
      }
    }

    loadAdmin()
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading admin dashboard…</p>

  if (error) {
    return (
      <div style={{ padding: 40, color: 'red' }}>
        <h2>Error loading Admin Dashboard</h2>
        <p>{error}</p>
        <p>Check the console for details.</p>
      </div>
    )
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
                        View Profile
                      </a>
                    ) : (
                      'No profile'
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
