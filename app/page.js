'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  // Candidate login/signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (!error) {
      router.push('/dashboard')
    } else alert(error.message)
  }

  async function signUp() {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (!error) {
      await supabase.from('users').insert({
        id: data.user.id,
        name: email.split('@')[0]
      })
      router.push('/dashboard')
    } else alert(error.message)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        gap: 30,
        padding: 20,
        backgroundColor: '#f5f5f5'
      }}
    >
      <h1 style={{ fontSize: 36 }}>Developer Assessment</h1>

      {/* Candidate Login/Signup */}
      <div
        style={{
          padding: 20,
          border: '1px solid #ccc',
          borderRadius: 10,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: 300
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 10 }}>Candidate Login / Signup</h2>
        <input
          type="email"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
        />
        <button
          onClick={signIn}
          style={{
            padding: 10,
            backgroundColor: '#0070f3',
            color: '#fff',
            borderRadius: 5,
            border: 'none',
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          Login
        </button>
        <button
          onClick={signUp}
          style={{
            padding: 10,
            backgroundColor: '#28a745',
            color: '#fff',
            borderRadius: 5,
            border: 'none',
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          Signup
        </button>
      </div>

      {/* Company Login */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          border: '1px solid #ccc',
          borderRadius: 10,
          backgroundColor: '#fff',
          width: 300,
          textAlign: 'center'
        }}
      >
        <h2>Company Access</h2>
        <p style={{ color: '#555', marginBottom: 10 }}>Already a registered company?</p>
        <a
          href="/company/login"
          style={{
            padding: 10,
            display: 'inline-block',
            backgroundColor: '#ff9800',
            color: '#fff',
            borderRadius: 5,
            textDecoration: 'none'
          }}
        >
          Company Login
        </a>
      </div>
    </main>
  )
}
