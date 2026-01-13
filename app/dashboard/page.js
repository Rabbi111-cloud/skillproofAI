'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function CandidateDashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1️⃣ GET AUTH USER
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) {
          router.replace('/login')
          return
        }
        const userId = authData.user.id

        // 2️⃣ GET PROFILE
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (profileError || !profileData) throw new Error('Profile not found')

        // 3️⃣ BLOCK COMPANY USERS
        if (profileData.role !== 'candidate') {
          router.replace('/company/dashboard')
          return
        }

        setProfile(profileData)

        // 4️⃣ FETCH ASSESSMENT RESULT
        const { data: resultData } = await supabase
          .from('results')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        setResult(resultData || null)

      } catch (err) {
        console.error('[Candidate Dashboard Error]', err)
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) return <p style={{ padding: 30 }}>Loading dashboard…</p>

  if (error) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.replace('/login')}>Login</button>
      </div>
    )
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Candidate Dashboard</h1>
      <p>Welcome, {profile.email}</p>

      {result ? (
        <>
          <h2>Assessment Completed ✅</h2>
          <p><strong>Score:</strong> {result.score}%</p>
          <p><strong>Skill Breakdown:</strong></p>
          <pre>{JSON.stringify(result.breakdown, null, 2)}</pre>

          <button onClick={() => router.push(`/p/${profile.user_id}`)}>
            View Profile
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => window.open(`/p/${profile.user_id}`, '_blank')}
          >
            Share Profile
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => router.replace('/dashboard')}
          >
            Back to Dashboard
          </button>
        </>
      ) : (
        <button onClick={() => router.push('/assessment/1')}>
          Take Assessment
        </button>
      )}
    </main>
  )
}
