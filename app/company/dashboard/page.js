'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Sidebar from '../../components/Sidebar'

export default function CompanyDashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentPage, setCurrentPage] = useState(0)
  const candidatesPerPage = 6

  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) setTheme(savedTheme)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) {
          router.replace('/company/login')
          return
        }

        const userId = authData.user.id

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (profileError || !profileData) throw new Error('Profile not found')

        if (profileData.role !== 'company') {
          router.replace('/dashboard')
          return
        }

        setProfile(profileData)

        const { data: candidatesData, error: candidatesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'candidate')

        if (candidatesError) throw candidatesError

        setCandidates(candidatesData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.replace('/company/login')}>
          Login
        </button>
      </div>
    )
  }

  const startIndex = currentPage * candidatesPerPage
  const currentCandidates = candidates.slice(
    startIndex,
    startIndex + candidatesPerPage
  )
  const totalPages = Math.ceil(candidates.length / candidatesPerPage)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ✅ SIDEBAR */}
      <Sidebar role="company" />

      {/* ✅ MAIN CONTENT */}
      <main style={{ flex: 1, padding: 40 }}>
        {/* ✅ THEME TOGGLE */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            padding: '8px 14px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--card)',
            color: 'var(--text)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
            zIndex: 999
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1>Company Dashboard</h1>
          <p style={{ color: '#64748b' }}>Welcome, {profile.email}</p>

          <h2 style={{ marginTop: 30 }}>Candidates</h2>

          <div style={grid}>
            {currentCandidates.map(c => (
              <div key={c.user_id} style={card}>
                <strong>{c.email}</strong>
                <p>Score: {c.score ?? 'N/A'}</p>
                <button
                  style={primaryBtn}
                  onClick={() => router.push(`/p/${c.user_id}`)}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: 30 }}>
              <button
                style={secondaryBtn}
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
              >
                Previous
              </button>
              <button
                style={{ ...secondaryBtn, marginLeft: 10 }}
                disabled={currentPage === totalPages - 1}
                onClick={() =>
                  setCurrentPage(p => Math.min(p + 1, totalPages - 1))
                }
              >
                Next
              </button>
            </div>
          )}

          <button
            style={{ ...dangerBtn, marginTop: 40 }}
            onClick={() => router.push('/logout')}
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  )
}

/* ===== STYLES ===== */
const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: 20
}

const card = {
  background: 'var(--card)',
  padding: 20,
  borderRadius: 14,
  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
  textAlign: 'center'
}

const primaryBtn = {
  marginTop: 10,
  padding: '8px 16px',
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer'
}

const secondaryBtn = {
  ...primaryBtn,
  background: '#e5e7eb',
  color: 'var(--text)'
}

const dangerBtn = {
  ...primaryBtn,
  background: 'var(--danger)'
}
