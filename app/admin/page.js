'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function Home() {
  const router = useRouter()
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminError, setAdminError] = useState('')

  const handleAdminSubmit = (e) => {
    e.preventDefault()
    setAdminError('')

    if (adminEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      router.push('/admin')
    } else {
      setAdminError('Invalid admin email.')
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a, #020617)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          background: '#ffffff',
          borderRadius: 16,
          padding: 40,
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }}
      >
        <h1 style={{ textAlign: 'center', fontSize: 36, marginBottom: 10 }}>
          SKILLPROOF
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b' }}>
          Prove skills. Hire smarter.
        </p>

        {/* Dashboard Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 30,
            marginTop: 40
          }}
        >
          {/* Candidate */}
          <div style={cardStyle}>
            <h2>Candidate</h2>
            <button style={primaryBtn} onClick={() => router.push('/signup')}>
              Signup
            </button>
            <button style={secondaryBtn} onClick={() => router.push('/login')}>
              Login
            </button>
          </div>

          {/* Company */}
          <div style={cardStyle}>
            <h2>Company</h2>
            <button
              style={primaryBtn}
              onClick={() => router.push('/company/signup')}
            >
              Signup
            </button>
            <button
              style={secondaryBtn}
              onClick={() => router.push('/company/login')}
            >
              Login
            </button>
          </div>
        </div>

        {/* Admin Access */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          {!showAdminLogin ? (
            <button
              style={{
                ...primaryBtn,
                width: 'auto',
                padding: '10px 20px',
                marginTop: 10
              }}
              onClick={() => setShowAdminLogin(true)}
            >
              Admin Access
            </button>
          ) : (
            <form
              onSubmit={handleAdminSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'center', marginTop: 10 }}
            >
              <input
                type="email"
                placeholder="Admin Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', width: 250 }}
              />
              {adminError && <p style={{ color: 'red' }}>{adminError}</p>}
              <button type="submit" style={{ ...primaryBtn, width: 'auto', padding: '10px 20px' }}>
                Login as Admin
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 30,
  textAlign: 'center'
}

const primaryBtn = {
  width: '100%',
  padding: 12,
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  cursor: 'pointer',
  marginBottom: 10
}

const secondaryBtn = {
  ...primaryBtn,
  background: '#e5e7eb',
  color: '#111827'
}
