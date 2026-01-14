'use client'

import { useRouter } from 'next/navigation'

export default function Sidebar({ role }) {
  const router = useRouter()

  return (
    <aside style={sidebar}>
      <h2 style={{ marginBottom: 30 }}>SKILLPROOF</h2>

      {role === 'candidate' && (
        <>
          <button style={navBtn} onClick={() => router.push('/dashboard')}>
            Dashboard
          </button>
          <button style={navBtn} onClick={() => router.push('/assessment/1')}>
            Assessment
          </button>
        </>
      )}

      {role === 'company' && (
        <>
          <button
            style={navBtn}
            onClick={() => router.push('/company/dashboard')}
          >
            Candidates
          </button>
        </>
      )}

      <button
        style={{ ...navBtn, marginTop: 'auto', color: 'var(--danger)' }}
        onClick={() => router.push('/logout')}
      >
        Logout
      </button>
    </aside>
  )
}

const sidebar = {
  width: 240,
  minHeight: '100vh',
  background: 'var(--card)',
  borderRight: '1px solid var(--border)',
  padding: 20,
  display: 'flex',
  flexDirection: 'column'
}

const navBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text)',
  padding: '10px 0',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 16
}
