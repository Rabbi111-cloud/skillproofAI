'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanySignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const router = useRouter()

  async function handleSignup() {
    if (!email || !password || !companyName)
      return alert('All fields are required')

    try {
      // 1️⃣ Sign up in Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      const userId = data.user.id

      // 2️⃣ Insert company profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: userId,
        email,
        role: 'company',
        company_id: userId, // company ID references itself
        company_name: companyName
      })

      if (profileError) throw profileError

      alert('Company registered successfully! Please login now.')
      router.push('/company/login')
    } catch (err) {
      console.error(err)
      alert('Signup failed: ' + (err.message || JSON.stringify(err)))
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Signup</h1>

      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={e => setCompanyName(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: 6 }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: 6 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: 6 }}
      />

      <button
        onClick={handleSignup}
        style={{ padding: '6px 12px', marginTop: 10 }}
      >
        Signup
      </button>

      <p style={{ marginTop: 20 }}>
        Already have an account? <a href="/company/login">Login here</a>
      </p>
    </div>
  )
}
