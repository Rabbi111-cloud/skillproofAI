'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanySignup() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    try {
      // 1️⃣ Validate company name
      if (!companyName.trim()) {
        alert('Please enter your company name.')
        setLoading(false)
        return
      }

      // 2️⃣ Check if email already exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .maybeSingle()

      if (existingProfile) {
        if (existingProfile.role === 'company') {
          alert('This email is already registered as a company. Please login.')
        } else {
          alert('This email is registered as a candidate. Use candidate login.')
        }
        setLoading(false)
        return
      }

      // 3️⃣ Signup in Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (!data.user) throw new Error('Signup failed')

      // 4️⃣ Insert profile with company name
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        email,
        role: 'company',
        company_name: companyName
      })

      alert('Signup successful! Please login.')
      router.push('/company/login')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h1>Company Signup</h1>

      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={e => setCompanyName(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />

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
        onClick={handleSignup}
        disabled={loading}
        style={{ width: '100%', padding: 12 }}
      >
        {loading ? 'Signing up...' : 'Signup'}
      </button>
    </main>
  )
}
