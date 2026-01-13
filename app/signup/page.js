'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function CandidateSignup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    try {
      // 1️⃣ Try signup
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error && error.message.includes('User already registered')) {
        // User exists → check profile table
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', email)
          .maybeSingle()

        if (existingProfile) {
          if (existingProfile.role === 'candidate') {
            alert('Email already registered as candidate. Please login.')
            router.push('/login')
            return
          } else {
            throw new Error('Email already registered as company. Use company login.')
          }
        } else {
          throw new Error('Email exists but profile missing. Contact support.')
        }
      }

      if (error) throw error
      if (!data.user) throw new Error('Signup failed')

      // 2️⃣ Insert profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        email,
        role: 'candidate'
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
    <main style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h1>Candidate Signup</h1>
      <input
        type="email"
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
        onClick={handleSignup}
        disabled={loading}
        style={{ width: '100%', padding: 12 }}
      >
        {loading ? 'Signing up...' : 'Signup'}
      </button>
    </main>
  )
}
