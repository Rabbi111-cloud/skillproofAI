'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1️⃣ AUTHENTICATE
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({ email, password })

      if (authError) throw authError
      if (!data?.user) throw new Error('Authentication failed')

      const userId = data.user.id

      // 2️⃣ CHECK PROFILE EXISTS
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      // 🚨 NO PROFILE → FORCE SIGNUP
      if (!profile) {
        router.push('/signup')
        return
      }

      // 3️⃣ ROLE-BASED ROUTING
      if (profile.role === 'company') {
        router.push('/company/dashboard')
      } else {
        router.push('/dashboard')
      }

    } catch (err) {
      console.error('[LOGIN ERROR]', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 400 }}>
      <h1>Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: 10, width: '100%' }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: 20, width: '100%' }}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in…' : 'Login'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: 15 }}>{error}</p>
      )}
    </main>
  )
}
