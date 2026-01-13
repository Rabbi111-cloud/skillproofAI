'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) {
      alert('Email and password are required')
      return
    }

    // 1️⃣ Auth login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data?.user) {
      alert(error?.message || 'Login failed')
      return
    }

    const user = data.user

    // 2️⃣ Try fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // 3️⃣ AUTO-FIX missing or broken company profile
    if (profileError || !profile || profile.role !== 'company') {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            role: 'company',
            company_id: user.id,
          },
          { onConflict: ['user_id'] }
        )

      if (upsertError) {
        alert('Company profile could not be fixed. Please try again.')
        await supabase.auth.signOut()
        return
      }
    }

    // 4️⃣ SUCCESS
    router.push('/company/dashboard')
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

      <button onClick={handleLogin} style={{ padding: '6px 12px' }}>
        Login
      </button>
    </div>
  )
}
