'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'

export default function CandidateDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) {
          router.replace('/login')
          return
        }

        const userId = authData.user.id
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error || !data) throw new Error('Profile not found')

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

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>
  if (error)
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.replace('/login')}>Login</button>
      </div>
    )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar role="candidate" />
      <main style={{ flex: 1, padding: 40 }}>
        <ThemeToggle />

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1>Candidate Dashboard</h1>
          <p style={{ color: '#64748b' }}>Welcome, {profile.email}</p>

          {profile.assessment_completed ? (
            <div style={card}>
              <h2>Assessment Completed ✅</h2>
              <div style={score}>{profile.score}%</div>

              <h3>Skill Breakdown</h3>
              <pre style={pre}>
                {JSON.stringify(profile.breakdown, null, 2)}
              </pre>

              <div style={{ marginTop: 20 }}>
                <button style={primaryBtn} onClick={() => router.push(`/p/${profile.user_id}`)}>View Profile</button>
                <button style={{ ...secondaryBtn, marginLeft: 10 }} onClick={() => window.open(`/p/${profile.user_id}`, '_blank')}>Share Profile</button>
              </div>
            </div>
          ) : (
            <button style={primaryBtn} onClick={() => router.push('/assessment/1')}>Take Assessment</button>
          )}

          <button style={{ ...dangerBtn, marginTop: 30 }} onClick={() => router.push('/logout')}>Logout</button>
        </div>
      </main>
    </div>
  )
}

/* ===== STYLES ===== */
const card = { background: 'var(--card)', padding: 30, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginTop: 30 }
const score = { fontSize: 42, fontWeight: 'bold', color: 'var(--primary)', margin: '20px 0' }
const pre = { background: '#020617', color: '#e5e7eb', padding: 15, borderRadius: 8 }
const primaryBtn = { padding: '10px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
const secondaryBtn = { ...primaryBtn, background: 'var(--secondary)', color: 'var(--text)' }
const dangerBtn = { ...primaryBtn, background: 'var(--danger)' }
