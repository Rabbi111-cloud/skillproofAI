'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main style={{ padding: 40, maxWidth: 500, margin: '0 auto' }}>
      <h1>Developer Assessment Platform</h1>

      <section style={{ marginTop: 30 }}>
        <h2>Candidate</h2>
        <button
          onClick={() => router.push('/signup')}
          style={{ padding: 12, width: '100%', marginBottom: 10 }}
        >
          Candidate Signup
        </button>
        <button
          onClick={() => router.push('/login')}
          style={{ padding: 12, width: '100%' }}
        >
          Candidate Login
        </button>
      </section>

      <section style={{ marginTop: 50 }}>
        <h2>Company</h2>
        <button
          onClick={() => router.push('/company/signup')}
          style={{ padding: 12, width: '100%', marginBottom: 10 }}
        >
          Company Signup
        </button>
        <button
          onClick={() => router.push('/company/login')}
          style={{ padding: 12, width: '100%' }}
        >
          Company Login
        </button>
      </section>
    </main>
  )
}
