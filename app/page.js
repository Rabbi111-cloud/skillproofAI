'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  // ✅ USER SIGNUP (developers only)
  async function signUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) return alert(error.message)

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id, // ✅ correct column
        email,
        role: 'user'           // ✅ always user here
      })

    if (profileError) return alert(profileError.message)

    router.push('/dashboard')
  }

  // ✅ LOGIN (auto-detect role)
  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) return alert(error.message)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user.id) // ✅ correct column
      .single()

    if (profileError || !profile) {
      return alert('Profile not found. Please contact support.')
    }

    if (profile.role === 'company') {
      router.push('/company/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 400 }}>
      <h1>Developer Assessment</h1>

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

      <button onClick={signIn} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
        Login
      </button>

      <button onClick={signUp} style={{ width: '100%', padding: 10 }}>
        Sign up as Developer
      </button>

      <p style={{ marginTop: 20 }}>
        Are you a company?{' '}
        <a href="/company/signup">Create a company account</a>
      </p>
    </main>
  )
}
