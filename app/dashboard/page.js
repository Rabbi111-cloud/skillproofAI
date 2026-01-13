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
        setError(null)

        // 1️⃣ AUTH GUARD
        const { data: authData, error: authError } =
          await supabase.auth.getUser()

        if (authError || !authData?.user) {
          router.push('/login')
          return
        }

        const userId = authData.user.id

        // 2️⃣ FETCH PROFILE
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (profileError || !profileData) {
          throw new Error('Profile not found')
        }

        // 🚫 BLOCK COMPANIES
        if (profileData.role === 'company') {
          router.push('/company/dashboard')
          return
        }

        setProfile(profileData)

        // 3️⃣ FETCH RESULT (SOURCE OF TRUTH)
        const { data: resultData } = await supabase
          .from('results')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        setResult(resultData || null)

      } catch (err) {
        console.error('[DASHBOARD ERROR]', err)
        setError(err.message || 'Dashboard failed')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return <p style={{ padding: 30 }}>Loading dashboard…</p>
  }

  if (error) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.push('/login')}>
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Candidate Dashboard</h1>

      {result ? (
        <>
          <p>
            <strong>Score:</strong> {result.score}%
          </p>

          <button onClick={() => router.push(`/p/${profile.user_id}`)}>
            View Profile
          </button>

          <button
            onClick={() => window.open(`/p/${profile.user_id}`, '_blank')}
            style={{ marginLeft: 10 }}
          >
            Share Profile
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
