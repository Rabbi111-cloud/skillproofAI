'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleLogin() {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      const userId = data.user.id

      // 1️⃣ Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('user_id', userId)
        .single()

      if (profileError) {
        throw new Error('Profile not found. Please contact support.')
      }

      if (profile.role !== 'company' || !profile.company_id) {
        await supabase.auth.signOut()
        throw new Error('Access denied: Not a company account')
      }

      // 2️⃣ Verify company exists
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', profile.company_id)
        .single()

      if (companyError || !company) {
        await supabase.auth.signOut()
        throw new Error('Company record missing. Please contact support.')
      }

      router.push('/company/dashboard')

    } catch (err) {
      alert(`Company login failed.\nReason: ${err.message}`)
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Login</h1>

      <input
        placeholder="Company Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: 8 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: 8 }}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
