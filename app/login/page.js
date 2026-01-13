'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function CandidateLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function login() {
    setLoading(true)

    try {
      // 1️⃣ AUTH
      const { data, error } = await supabase.auth.signInWithPassword({
        email, password
      })

      if (error) throw error
      if (!data.user) throw new Error('Login failed')

      // 2️⃣ ROLE CHECK
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (!profile || profile.role !== 'candidate') {
        await supabase.auth.signOut()
        throw new Error('This account is not a candidate account')
      }

      router.replace('/dashboard')

    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Candidate Login</h1>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </main>
  )
}
