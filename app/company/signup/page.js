'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanySignup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!email || !password || !companyName) {
      alert('All fields are required')
      return
    }

    setLoading(true)

    try {
      console.log('[SIGNUP] Creating auth user')

      /* 1️⃣ AUTH SIGNUP */
      const { data: authData, error: authError } =
        await supabase.auth.signUp({ email, password })

      if (authError) {
        console.error('[AUTH SIGNUP ERROR]', authError)
        throw authError
      }

      const user = authData.user
      if (!user) throw new Error('No user returned from auth signup')

      console.log('[SIGNUP] Auth user created:', user.id)

      /* 2️⃣ CREATE COMPANY */
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          name: companyName,
          email
        })

      if (companyError) {
        console.error('[COMPANY INSERT ERROR]', companyError)
        throw companyError
      }

      /* 3️⃣ CREATE PROFILE */
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email,
          role: 'company',
          company_id: user.id
        })

      if (profileError) {
        console.error('[PROFILE INSERT ERROR]', profileError)
        throw profileError
      }

      console.log('[SIGNUP SUCCESS]')
      alert('Signup successful. Please log in.')
      router.push('/company/login')

    } catch (err) {
      console.error('[SIGNUP FAILED]', err)
      alert(`Signup failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Signup</h1>

      <input placeholder="Company Name" value={companyName}
        onChange={e => setCompanyName(e.target.value)} />

      <input placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} />

      <input type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)} />

      <button onClick={handleSignup} disabled={loading}>
        {loading ? 'Signing up...' : 'Signup'}
      </button>
    </div>
  )
}
