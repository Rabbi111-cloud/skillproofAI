'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error
      if (!data?.user) throw new Error('No user session')

      // 🔑 FETCH ROLE
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (profileError) throw profileError

      // 🔀 ROLE-BASED REDIRECT
      if (profile.role === 'company') {
        router.push('/company/dashboard')
      } else {
        router.push('/dashboard')
      }

    } catch (err) {
      console.error('[LOGIN ERROR]', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Login</h1>

      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password}
        onChange={e => setPassword(e.target.value)} />

      <button onClick={handleLogin} disabled={loading}>
        Login
      </button>
    </div>
  )
}
