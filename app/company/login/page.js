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

  // ✅ Company signup
  async function signUp() {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      // Insert into profiles table with role 'company'
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        email,
        role: 'company'
      })

      // Insert into companies table (optional, for multi-company logic)
      await supabase.from('companies').insert({
        id: data.user.id, // same as user_id
        name: email.split('@')[0],
        email
      })

      router.push('/company/dashboard')
    } catch (err) {
      alert(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Company login
  async function signIn() {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Verify profile role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (profileError || !profile) return alert('Profile not found')
      if (profile.role !== 'company') return alert('Access denied: Not a company account')

      router.push('/company/dashboard')
    } catch (err) {
      alert(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 30, maxWidth: 400, margin: 'auto' }}>
      <h1>{mode === 'login' ? 'Company Login' : 'Company Signup'}</h1>

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
            onClick={signIn}
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
            onClick={signUp}
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
