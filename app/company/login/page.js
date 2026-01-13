'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (!data.user) throw new Error('No user session')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .maybeSingle()

      if (!profile) throw new Error('Profile not found. Please signup.')
      if (profile.role !== 'company') throw new Error('This email is registered for another role.')

      router.push('/company/dashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h1>Company Login</h1>
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
        onClick={handleLogin}
        disabled={loading}
        style={{ width: '100%', padding: 12 }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </main>
  )
}
