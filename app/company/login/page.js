'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanyLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [loading, setLoading] = useState(false)

  // Signup function
  async function handleSignup() {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      // Create profile as company
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        email,
        role: 'company'
      })

      // Create company record if not exists
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        await supabase.from('companies').insert({
          id: data.user.id,
          name: email.split('@')[0],
          email
        })
      }

      router.push('/company/dashboard')
    } catch (err) {
      alert(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  // Login function
  async function handleLogin() {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Ensure role is company
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (!profile) return alert('Profile not found')
      if (profile.role !== 'company') return alert('Access denied: Not a company account')

      router.push('/company/dashboard')
    } catch (err) {
      alert(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 30, maxWidth: 400, margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>{mode === 'login' ? 'Company Login' : 'Company Signup'}</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />

      {mode === 'login' ? (
        <>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ padding: 10, width: '100%', marginBottom: 10 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p style={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <span
              onClick={() => setMode('signup')}
              style={{ color: 'blue', cursor: 'pointer' }}
            >
              Sign up
            </span>
          </p>
        </>
      ) : (
        <>
          <button
            onClick={handleSignup}
            disabled={loading}
            style={{ padding: 10, width: '100%', marginBottom: 10 }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          <p style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <span
              onClick={() => setMode('login')}
              style={{ color: 'blue', cursor: 'pointer' }}
            >
              Login
            </span>
          </p>
        </>
      )}
    </main>
  )
}
