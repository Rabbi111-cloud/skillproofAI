'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanySignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup() {
    if (!email || !password || !companyName) {
      return alert('All fields are required')
    }

    setLoading(true)

    try {
      // 1️⃣ Check if email already belongs to a candidate
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .single()

      if (existingProfile?.role === 'candidate') {
        throw new Error('This email is already registered as a candidate')
      }

      // 2️⃣ Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error

      const userId = data.user.id

      // 3️⃣ Create company record FIRST
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          id: userId,
          name: companyName,
          email
        })

      if (companyError) throw companyError

      // 4️⃣ Create profile (NO company_name here ❗)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email,
          role: 'company',
          company_id: userId
        })

      if (profileError) throw profileError

      alert('Company registered successfully. Please log in.')
      router.push('/company/login')

    } catch (err) {
      alert(`Signup failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Signup</h1>

      <input
        placeholder="Company Name"
        value={companyName}
        onChange={e => setCompanyName(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: 8 }}
      />

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

      <button onClick={handleSignup} disabled={loading}>
        {loading ? 'Signing up...' : 'Signup'}
      </button>
    </div>
  )
}
