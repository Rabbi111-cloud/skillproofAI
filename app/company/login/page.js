'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) return alert('Please fill in email and password')
    setLoading(true)

    try {
      // 1️⃣ Sign in with Supabase Auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (loginError) {
        alert(`Login failed: ${loginError.message}`)
        setLoading(false)
        return
      }

      const user = data.user
      if (!user) {
        alert('Login failed: No user returned')
        setLoading(false)
        return
      }

      // 2️⃣ Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile) {
        alert('Profile not found. Please contact support.')
        setLoading(false)
        return
      }

      // 3️⃣ Verify company role
      if (profile.role !== 'company' || !profile.company_id) {
        alert('Access denied: Not a company account')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // ✅ Success — go to dashboard
      router.push('/company/dashboard')
    } catch (err) {
      console.error('Company login error:', err)
      alert('Company login failed. Reason: ' + (err.message || JSON.stringify(err)))
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
        Don't have an account? <a href="/company/signup">Signup here</a>
      </p>
    </div>
  )
}
