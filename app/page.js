'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main style={{ padding: 40, maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <h1>Developer Assessment Platform</h1>
      <p>Choose your role to get started:</p>

      <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 15 }}>
        {/* Candidate Buttons */}
        <button
          style={{ padding: 12, fontSize: 16 }}
          onClick={() => router.push('/signup')}
        >
          Candidate Signup
        </button>

        <button
          style={{ padding: 12, fontSize: 16 }}
          onClick={() => router.push('/login')}
        >
          Candidate Login
        </button>

        {/* Divider */}
        <hr style={{ margin: '20px 0' }} />

        {/* Company Buttons */}
        <button
          style={{ padding: 12, fontSize: 16 }}
          onClick={() => router.push('/company/signup')}
        >
          Company Signup
        </button>

        <button
          style={{ padding: 12, fontSize: 16 }}
          onClick={() => router.push('/company/login')}
        >
          Company Login
        </button>
      </div>
    </main>
  )
}
