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
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData?.user) {
        router.push('/login')
        return
      }

      const currentUser = authData.user
      setUser(currentUser)

      // ✅ Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      if (!profileError && profile) {
        // ✅ Only consider assessment done if score exists (not null) and skills exist
        if (typeof profile.score === 'number' && profile.skills) {
          setSubmission(profile)
        }
      }

      setLoading(false)
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard...</p>
  }

  return (
    <main style={{ padding: 30 }}>
      <h2>Welcome {user.email}</h2>

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
          <p><strong>Your Score:</strong> {submission.score}%</p>

          <div style={{ marginTop: 15 }}>
            <button onClick={() => router.push(`/p/${user.id}`)}>
              View Profile
            </button>

            <button
              onClick={() => window.open(`/p/${user.id}`, '_blank')}
              style={{ marginLeft: 10 }}
            >
              Share Profile
            </button>
          </div>
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
