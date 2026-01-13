'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanySignup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUp() {
    setLoading(true)

    try {
      // 1️⃣ CREATE AUTH USER
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
      if (!data.user) throw new Error('Signup failed')

      // 2️⃣ CHECK EXISTING PROFILE
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (existingProfile) {
        throw new Error('Account already exists')
      }

      // 3️⃣ CREATE COMPANY PROFILE
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email,
          role: 'company',
        })

      if (profileError) throw profileError

      router.replace('/company/dashboard')

    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 400, padding: 40 }}>
      <h1>Company Sign Up</h1>

      <input
        placeholder="Company Email"
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', marginBottom: 20 }}
      />

      <button onClick={signUp} disabled={loading}>
        {loading ? 'Creating account…' : 'Create Company Account'}
      </button>

      <p style={{ marginTop: 20 }}>
        Already a company? <a href="/company/login">Login</a>
      </p>
    </main>
  )
}
