'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function loadDashboard() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData?.user) {
        router.push('/')
        return
      }

      setUser(authData.user)

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle()

      if (!error) setSubmission(data)

      setLoading(false)
    }

    loadDashboard()
  }, [])

  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard...</p>
  }

  return (
    <main style={{ padding: 30 }}>
      <h2>Welcome {user.email}</h2>

      {/* 🔐 ADMIN BUTTON */}
      {user.email === ADMIN_EMAIL && (
        <button
          onClick={() => router.push('/admin')}
          style={{
            marginBottom: 20,
            padding: '10px 15px',
            background: '#0f172a',
            color: 'white',
            borderRadius: 6
          }}
        >
          🔐 Go to Admin Dashboard
        </button>
      )}

      {submission ? (
        <>
          <h3>Assessment Completed ✅</h3>
          <p><strong>Your Score:</strong> {submission.score}</p>

          <div style={{ marginTop: 15 }}>
            <button
              onClick={() => router.push(`/p/${user.id}`)}
              style={{ marginRight: 10 }}
            >
              View Profile
            </button>

            <button
              onClick={() => window.open(`/p/${user.id}`, '_blank')}
            >
              Share Profile
            </button>
          </div>
        </>
      ) : (
        <>
          <p>You have not taken the assessment yet.</p>

          <button onClick={() => router.push('/assessment')}>
            Take Assessment
          </button>
        </>
      )}
    </main>
  )
}
