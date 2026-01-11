'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user') // user | company
  const router = useRouter()

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return alert(error.message)

    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      role
    })

    router.push(role === 'company' ? '/company/dashboard' : '/dashboard')
  }

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (!profile) return alert('Profile not found')

    if (profile.role === 'company') router.push('/company/dashboard')
    else router.push('/dashboard')
  }

  return (
    <main>
      <h1>Developer Assessment</h1>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

      <select onChange={e => setRole(e.target.value)}>
        <option value="user">Developer</option>
        <option value="company">Company</option>
      </select>

      <button onClick={signIn}>Login</button>
      <button onClick={signUp}>Signup</button>
    </main>
  )
}
