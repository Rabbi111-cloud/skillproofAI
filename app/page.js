'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 🔐 LOGIN (auto-detect role)
  async function signIn() {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      if (!data.user) throw new Error('No user returned from login')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('Profile not found')
      }

      if (profile.role === 'company') {
        router.push('/company/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 👨‍💻 DEVELOPER SIGNUP ONLY
  async function signUp() {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error
      if (!data.user) throw new Error('Signup failed')

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email,
          role: 'user'
        })

      if (profileError) throw profileError

      router.push('/dashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 420 }}>
      <h1>Developer Assessment Platform</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 20 }}
      />

      <button
        onClick={signIn}
        disabled={loading}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <button
        onClick={signUp}
        disabled={loading}
        style={{ width: '100%', padding: 10 }}
      >
        Sign up as Developer
      </button>

      {/* ✅ COMPANY ENTRY POINT */}
      <div style={{ marginTop: 30 }}>
        <p>
          Are you a company?{' '}
          <a href="/company/signup">Create a company account</a>
        </p>

        <p style={{ marginTop: 8 }}>
          Already registered?{' '}
          <a href="/company/login">Company Login</a>
        </p>
      </div>
    </main>
  )
}
