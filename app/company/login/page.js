'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function login() {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email, password
      })

      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (!profile || profile.role !== 'company') {
        await supabase.auth.signOut()
        throw new Error('This account is not a company account')
      }

      router.replace('/company/dashboard')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <main>
      <h1>Company Login</h1>
      <input onChange={e => setEmail(e.target.value)} />
      <input type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </main>
  )
}
