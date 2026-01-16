'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function AdminDashboard() {
  const [emailInput, setEmailInput] = useState('')
  const [isAllowed, setIsAllowed] = useState(false)
  const [activeTab, setActiveTab] = useState('candidates')

  const [profiles, setProfiles] = useState([])
  const [companies, setCompanies] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /* ================= ADMIN ACCESS ================= */
  async function handleAdminAccess(e) {
    e.preventDefault()
    setError('')
    setProfiles([])
    setCompanies([])

    if (!emailInput) {
      setError('Please enter admin email.')
      return
    }

    if (emailInput.toLowerCase() !== ADMIN_EMAIL) {
      setError('Access denied. Invalid admin email.')
      return
    }

    setIsAllowed(true)
    fetchData()
  }

  /* ================= FETCH DATA ================= */
  async function fetchData() {
    setLoading(true)
    setError('')

    try {
      // 🔹 Candidates
      const { data: candidateData, error: candErr } = await supabase
        .from('profiles')
        .select('user_id, email, score, breakdown, assessment_completed')
        .eq('role', 'candidate')
        .eq('assessment_completed', true)
        .order('score', { ascending: false })

      if (candErr) throw candErr

      // 🔹 Companies
      const { data: companyData, error: compErr } = await supabase
        .from('profiles')
        .select('user_id, email, company_name, created_at') // FETCH company_name
        .eq('role', 'company')
        .order('created_at', { ascending: false })

      if (compErr) throw compErr

      setProfiles(candidateData || [])
      setCompanies(companyData || [])
    } catch (err) {
      console.error('ADMIN FETCH ERROR:', err)
      setError(err.message || 'Failed to load admin dashboard data')
    } finally {
      setLoading(false)
    }
  }

  /* ================= LOGIN SCREEN ================= */
  if (!isAllowed) {
    return (
      <main style={{ padding: 40, maxWidth: 500, margin: '0 auto' }}>
        <h2>Admin Access</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form
          onSubmit={handleAdminAccess}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            type="email"
            placeholder="Admin email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
          />

          <button
            type="submit"
            style={{
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Enter Admin Dashboard
          </button>
        </form>
      </main>
    )
  }

  /* ================= DASHBOARD ================= */
  return (
    <main style={{ padding: 40 }}>
      <h2>Admin Dashboard</h2>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('candidates')}
          style={{
            marginRight: 10,
            padding: 8,
            background: activeTab === 'candidates' ? '#2563eb' : '#e5e7eb',
            color: activeTab === 'candidates' ? '#fff' : '#000',
            border: 'none',
            borderRadius: 6
          }}
        >
          Candidates
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          style={{
            padding: 8,
            background: activeTab === 'companies' ? '#2563eb' : '#e5e7eb',
            color: activeTab === 'companies' ? '#fff' : '#000',
            border: 'none',
            borderRadius: 6
          }}
        >
          Companies
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ================= CANDIDATES ================= */}
      {!loading && activeTab === 'candidates' && (
        <>
          {profiles.length === 0 ? (
            <p>No completed candidates found.</p>
          ) : (
            <table border="1" cellPadding="10" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Skill Breakdown</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.user_id}>
                    <td>{p.email}</td>
                    <td>{p.score ?? 'N/A'}</td>
                    <td>
                      {p.breakdown
                        ? JSON.stringify(p.breakdown)
                        : 'No breakdown'}
                    </td>
                    <td>
                      <a href={`/p/${p.user_id}`} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ================= COMPANIES ================= */}
      {!loading && activeTab === 'companies' && (
        <>
          {companies.length === 0 ? (
            <p>No companies have signed up yet.</p>
          ) : (
            <table border="1" cellPadding="10" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Company Name</th> {/* NEW */}
                  <th>Email</th>
                  <th>Signup Date</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.user_id}>
                    <td>{c.company_name || '—'}</td> {/* SHOW NAME */}
                    <td>{c.email}</td>
                    <td>
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  )
}
