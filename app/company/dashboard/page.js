'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyDashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1️⃣ GET AUTH USER
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) {
          router.replace('/company/login')
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

        // 3️⃣ BLOCK CANDIDATES
        if (profileData.role !== 'company') {
          router.replace('/dashboard')
          return
        }

        setProfile(profileData)

        // 4️⃣ FETCH ALL CANDIDATE PROFILES
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'candidate')

        if (candidatesError) throw candidatesError
        setCandidates(candidatesData || [])

      } catch (err) {
        console.error('[Company Dashboard Error]', err)
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
        <button onClick={() => router.replace('/company/login')}>
          Login
        </button>
      </div>
    )
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Company Dashboard</h1>
      <p>Welcome, {profile.email}</p>

      <h2>All Candidates</h2>
      {candidates.length === 0 ? (
        <p>No candidates registered yet.</p>
      ) : (
        <ul>
          {candidates.map(c => (
            <li key={c.user_id} style={{ marginBottom: 10 }}>
              <strong>{c.email}</strong>
              <button
                style={{ marginLeft: 10 }}
                onClick={() => router.push(`/p/${c.user_id}`)}
              >
                View Profile
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
