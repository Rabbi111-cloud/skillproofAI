'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanySignup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    try {
      const { data: existingUser } = await supabase.auth.getUserByEmail(email)

      if (existingUser?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', existingUser.user.id)
          .single()

        if (profile?.role === 'company') {
          alert('This email is already registered as company. Please login.')
          router.push('/company/login')
          return
        } else if (profile?.role === 'candidate') {
          throw new Error('This email is already registered as candidate. Use candidate login.')
        } else {
          throw new Error('This email exists but profile is invalid. Contact support.')
        }
      }

      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (!data.user) throw new Error('Signup failed')

      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        email,
        role: 'company'
      })
      if (profileError) throw profileError

      router.push('/company/dashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h1>Company Signup</h1>
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
