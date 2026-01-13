'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) return alert('Email and password are required')

    try {
      // 1️⃣ Sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return alert(error.message)

      const userId = data.user.id

      // 2️⃣ Fetch profile and check company role
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('role, company_name')
        .eq('user_id', userId)
        .single()

      if (profError || !profile) {
        alert('Profile not found. Please contact support.')
        await supabase.auth.signOut()
        router.push('/company/login')
        return
      }

      // 3️⃣ Ensure it's a company account
      if (profile.role !== 'company' || !profile.company_name) {
        alert('Access denied: Not a company account')
        await supabase.auth.signOut()
        return
      }

      // 4️⃣ Redirect to company dashboard
      router.push('/company/dashboard')

    } catch (err) {
      console.error(err)
      alert('Login failed: ' + (err.message || JSON.stringify(err)))
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

      <button onClick={handleLogin} style={{ padding: '6px 12px', marginTop: 10 }}>
        Login
      </button>

      <p style={{ marginTop: 20 }}>
        Don't have an account? <a href="/company/signup">Signup here</a>
      </p>
    </div>
  )
}
