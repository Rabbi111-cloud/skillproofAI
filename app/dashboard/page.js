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
        // 1️⃣ Auth check
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) {
          router.replace('/login')
          return
        }

        const userId = authData.user.id

        // 2️⃣ Fetch profile (THIS is the source of truth)
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error || !profileData) {
          throw new Error('Profile not found')
        }

        // 3️⃣ Block companies
        if (profileData.role !== 'candidate') {
          router.replace('/company/dashboard')
          return
        }

        setProfile(profileData)

      } catch (err) {
        setError(err.message)
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
      </div>
    )
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Candidate Dashboard</h1>
      <p>Welcome, {profile.email}</p>

      {/* ✅ ASSESSMENT COMPLETED */}
      {profile.score !== null ? (
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

      <hr style={{ margin: '30px 0' }} />

      <button
        onClick={async () => {
          await supabase.auth.signOut()
          router.replace('/')
        }}
      >
        Logout
      </button>
    </main>
  )
}

