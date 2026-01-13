'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CandidateDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth?.user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', auth.user.id)
          .single()

        if (error) throw error

        if (data.role === 'company') {
          router.push('/company/dashboard')
          return
        }

        setProfile(data)
      } catch (err) {
        console.error('[DASHBOARD ERROR]', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  if (loading) return <p>Loading...</p>

  return (
    <main style={{ padding: 30 }}>
      <h1>Candidate Dashboard</h1>

      {profile?.score != null ? (
        <>
          <p><strong>Score:</strong> {profile.score}%</p>
          <button onClick={() => router.push(`/p/${profile.user_id}`)}>
            View Profile
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
