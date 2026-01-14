'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function AdminDashboard() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadAdmin() {
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
        .from('assessments')
        .select('user_id, score, breakdown')

      if (!error && data) {
        setResults(data)
      }

      setLoading(false)
    }

    loadAdmin()
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>

  return (
    <main style={{ padding: 40 }}>
      <h2>Admin Dashboard</h2>

      {results.length === 0 ? (
        <p>No data yet</p>
      ) : (
        <ul>
          {results.map(r => (
            <li key={r.user_id}>
              Score: {r.score ?? 'N/A'}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
