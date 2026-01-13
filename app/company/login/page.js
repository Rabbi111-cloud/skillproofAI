'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) {
      alert('Email and password are required')
      return
    }

    setLoading(true)

    try {
      // 1️⃣ Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        alert(`Login failed: ${error.message}`)
        setLoading(false)
        return
      }

      const user = data.user
      if (!user) {
        alert('Authentication failed')
        setLoading(false)
        return
      }

      // 2️⃣ Ensure COMPANY exists first (FIXES FK ERROR)
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!company) {
        const { error: createCompanyError } = await supabase
          .from('companies')
          .insert({
            id: user.id,
            email: user.email,
            name: user.email.split('@')[0] // safe fallback
          })

        if (createCompanyError) {
          alert(
            `Company creation failed:\n${createCompanyError.message}`
          )
          await supabase.auth.signOut()
          setLoading(false)
          return
        }
      }

      // 3️⃣ Ensure PROFILE exists & is company
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            role: 'company',
            company_id: user.id
          },
          { onConflict: ['user_id'] }
        )

      if (profileError) {
        alert(
          `Profile setup failed:\n${profileError.message}`
        )
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // 4️⃣ Redirect to dashboard
      router.push('/company/dashboard')
    } catch (err) {
      alert(
        `Company login failed.\nReason: ${err.message || JSON.stringify(err)}`
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
        placeholder="Company Email"
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
        disabled={loading}
        style={{ padding: '6px 12px', marginTop: 10 }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p style={{ marginTop: 20 }}>
        Don&apos;t have an account? <a href="/company/signup">Signup here</a>
      </p>
    </div>
  )
}
