'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function CandidateDashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      setErrorMsg(null)

      try {
        console.log('DASHBOARD: fetching auth user')

        // 1️⃣ GET AUTH USER
        const { data: authData, error: authError } =
          await supabase.auth.getUser()

        if (authError) {
          console.error('DASHBOARD AUTH ERROR:', authError)
          throw new Error(`Auth error: ${authError.message}`)
        }

        if (!authData?.user) {
          throw new Error('No authenticated user found')
        }

        console.log('DASHBOARD: user', authData.user.id)

        // 2️⃣ FETCH PROFILE
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single()

        if (error) {
          console.error('DASHBOARD PROFILE ERROR:', error)
          throw new Error(
            `Profile fetch failed: ${error.message} (${error.code})`
          )
        }

        if (!data) {
          throw new Error('Profile returned null')
        }

        console.log('DASHBOARD: profile', data)

        // 3️⃣ BLOCK COMPANIES
        if (data.role === 'company') {
          console.warn('DASHBOARD: company detected, redirecting')
          router.push('/company/dashboard')
          return
        }

        setProfile(data)

      } catch (err) {
        console.error('DASHBOARD FATAL ERROR:', err)
        setErrorMsg(err.message || JSON.stringify(err))
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard…</p>
  }

  if (errorMsg) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Dashboard Error</h2>
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {errorMsg}
        </pre>
        <button onClick={() => router.push('/login')}>
          Go back to login
        </button>
      </div>
    )
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Candidate Dashboard</h1>

      {profile.score != null ? (
        <>
          <p><strong>Score:</strong> {profile.score}%</p>

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
