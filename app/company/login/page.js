'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) {
      return alert('Email and password are required')
    }

    setLoading(true)
    try {
      // 1️⃣ Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      if (!data.user) throw new Error('Login failed')

      const user = data.user

      // 2️⃣ Fetch profile
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', user.id)
        .single()

      if (profError || !profile) {
        throw new Error('Profile not found. Please contact support.')
      }

      // 3️⃣ Ensure it is a company account
      if (profile.role !== 'company' || !profile.company_id) {
        await supabase.auth.signOut()
        throw new Error('Access denied: Not a company account')
      }

      // 4️⃣ Redirect to company dashboard
      router.push('/company/dashboard')
    } catch (err) {
      console.error('Company login failed:', err)
      alert(
        `Company login failed. Reason: ${err.message || JSON.stringify(err)}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: 6 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: 6 }}
      />

      <button
        onClick={handleLogin}
        style={{ padding: '6px 12px', marginTop: 10 }}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p style={{ marginTop: 20 }}>
        Don't have an account?{' '}
        <a href="/company/signup">Signup here</a>
      </p>
    </div>
  )
}
