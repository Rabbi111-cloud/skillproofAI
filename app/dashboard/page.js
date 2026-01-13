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
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user) {
        router.push('/login')
        return
      }

      setUser(authData.user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('score')
        .eq('user_id', authData.user.id)
        .single()

      // ✅ IMPORTANT FIX
      if (profile?.score > 0) {
        setSubmission(profile)
      }

      setLoading(false)
    }

    loadDashboard()
  }, [router])

  if (loading) return <p>Loading dashboard...</p>

  return (
    <main style={{ padding: 30 }}>
      <h2>Welcome {user.email}</h2>

      {user.email === ADMIN_EMAIL && (
        <button onClick={() => router.push('/admin')}>
          🔐 Go to Admin Dashboard
        </button>
      )}

      {submission ? (
        <>
          <h3>Assessment Completed ✅</h3>
          <p><strong>Your Score:</strong> {submission.score}%</p>

          <button onClick={() => router.push(`/p/${user.id}`)}>
            View Profile
          </button>

          <button onClick={() => window.open(`/p/${user.id}`, '_blank')}>
            Share Profile
          </button>
        </>
      ) : (
        <>
          <p>You have not taken the assessment yet.</p>
          <button onClick={() => router.push('/assessment/1')}>
            Take Assessment
          </button>
        </>
      )}
    </main>
  )
}
