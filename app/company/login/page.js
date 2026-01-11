'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async e => {
    e.preventDefault()
    setError('')

    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }

    // Fetch company_id from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || !profile.company_id) {
      setError('Access denied: Not a company account')
      await supabase.auth.signOut()
      return
    }

    router.push('/company/dashboard')
  }

  return (
    <div style={{ padding: 30, maxWidth: 400 }}>
      <h2>Company Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ padding: 8, backgroundColor: '#0070f3', color: '#fff' }}>Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
