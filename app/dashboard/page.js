'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function CandidateDashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1️⃣ Auth user
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) {
          router.replace('/login')
          return
        }

        const userId = authData.user.id

        // 2️⃣ Profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error || !data) {
          throw new Error('Profile not found')
        }

        if (data.role !== 'candidate') {
          router.replace('/company/dashboard')
          return
        }

        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) return <p style={{ padding: 30 }}>Loading…</p>

  if (error) {
    return (
      <div style={{ padding: 30 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.replace('/login')}>Login</button>
      </div>
    )
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Candidate Dashboard</h1>
      <p>Welcome, {profile.email}</p>

      {profile.assessment_completed ? (
        <>
          <h2>Assessment Completed ✅</h2>
          <p><strong>Score:</strong> {profile.score}%</p>

          <h3>Skill Breakdown</h3>
          <pre>{JSON.stringify(profile.breakdown, null, 2)}</pre>

          <button onClick={() => router.push(`/p/${profile.user_id}`)}>
            View Profile
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => window.open(`/p/${profile.user_id}`, '_blank')}
          >
            Share Profile
          </button>
        </>
      ) : (
        <button onClick={() => router.push('/assessment/1')}>
          Take Assessment
        </button>
      )}

      <button
        style={{ marginTop: 20 }}
        onClick={() => router.push('/logout')}
      >
        Logout
      </button>
    </main>
  )
}
