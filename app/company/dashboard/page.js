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

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const candidatesPerPage = 6 // adjust how many per "row/page"

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

  // ✅ Calculate current page candidates
  const startIndex = currentPage * candidatesPerPage
  const currentCandidates = candidates.slice(
    startIndex,
    startIndex + candidatesPerPage
  )
  const totalPages = Math.ceil(candidates.length / candidatesPerPage)

  return (
    <main style={{ padding: 30 }}>
      <h1>Company Dashboard</h1>
      <p>Welcome, {profile.email}</p>

      <h2>All Candidates</h2>
      {candidates.length === 0 ? (
        <p>No candidates registered yet.</p>
      ) : (
        <>
          {/* ✅ Horizontal row */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20
          }}>
            {currentCandidates.map(c => (
              <div key={c.user_id} style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 15,
                minWidth: 200,
                textAlign: 'center'
              }}>
                <strong>{c.email}</strong>
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => router.push(`/p/${c.user_id}`)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 5,
                      cursor: 'pointer'
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Pagination buttons */}
          {totalPages > 1 && (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
                style={{ marginRight: 10, padding: '5px 10px', borderRadius: 5 }}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                disabled={currentPage === totalPages - 1}
                style={{ padding: '5px 10px', borderRadius: 5 }}
              >
                Next
              </button>
              <span style={{ marginLeft: 15 }}>
                Page {currentPage + 1} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {/* ✅ LOGOUT BUTTON */}
      <button
        style={{
          marginTop: 30,
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer'
        }}
        onClick={() => router.push('/logout')}
      >
        Logout
      </button>
    </main>
  )
}
