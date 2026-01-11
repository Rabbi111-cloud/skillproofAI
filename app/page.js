'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Candidate states
  const [cEmail, setCEmail] = useState('')
  const [cPassword, setCPassword] = useState('')

  // Company states
  const [coEmail, setCoEmail] = useState('')
  const [coPassword, setCoPassword] = useState('')

  // Candidate login
  async function candidateSignIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: cEmail,
      password: cPassword
    })
    setLoading(false)
    if (!error) router.push('/dashboard')
    else alert(error.message)
  }

  // Candidate signup
  async function candidateSignUp() {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: cEmail,
      password: cPassword
    })
    setLoading(false)
    if (!error) {
      await supabase.from('users').insert({
        id: data.user.id,
        name: cEmail.split('@')[0]
      })
      router.push('/dashboard')
    } else alert(error.message)
  }

  // Company login
  async function companySignIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: coEmail,
      password: coPassword
    })
    setLoading(false)
    if (!error) router.push('/company/dashboard')
    else alert(error.message)
  }

  // Company signup
  async function companySignUp() {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: coEmail,
      password: coPassword
    })
    setLoading(false)
    if (!error) {
      await supabase.from('companies').insert({
        id: data.user.id,
        name: coEmail.split('@')[0],
        email: coEmail
      })
      router.push('/company/dashboard')
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
        gap: 40,
        padding: 20,
        backgroundColor: '#f5f5f5'
      }}
    >
      <h1 style={{ fontSize: 36 }}>Welcome to SkillProofAI</h1>

      {/* Candidate Card */}
      <div
        style={{
          padding: 20,
          border: '1px solid #ccc',
          borderRadius: 10,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: 320
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 10 }}>Candidate Login / Signup</h2>
        <input
          type="email"
          placeholder="Email"
          onChange={e => setCEmail(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setCPassword(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
        />
        <button
          onClick={candidateSignIn}
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
          onClick={candidateSignUp}
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

      {/* Company Card */}
      <div
        style={{
          padding: 20,
          border: '1px solid #ccc',
          borderRadius: 10,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: 320
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 10 }}>Company Login / Signup</h2>
        <input
          type="email"
          placeholder="Company Email"
          onChange={e => setCoEmail(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setCoPassword(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
        />
        <button
          onClick={companySignIn}
          style={{
            padding: 10,
            backgroundColor: '#ff9800',
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
          onClick={companySignUp}
          style={{
            padding: 10,
            backgroundColor: '#6f42c1',
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
    </main>
  )
}
