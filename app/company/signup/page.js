'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanySignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function signUpCompany() {
    try {
      setLoading(true)

      // 1️⃣ Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      // 2️⃣ Create company row
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: email.split('@')[0],
          email
        })
        .select()
        .single()

      if (companyError) throw companyError

      // 3️⃣ Create profile linked to company
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email,
          role: 'company',
          company_id: company.id
        })

      if (profileError) throw profileError

      router.push('/company/dashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 400 }}>
      <h1>Company Sign Up</h1>

      <input
        placeholder="Company Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />

      <button
        onClick={signUpCompany}
        disabled={loading}
        style={{ padding: 10, width: '100%' }}
      >
        {loading ? 'Creating company…' : 'Create Company Account'}
      </button>
    </main>
  )
}
