'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

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
