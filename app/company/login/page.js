'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password')
      return
    }

    setLoading(true)

    try {
      console.log('[LOGIN] Attempting login for:', email)

      /* 1️⃣ AUTH LOGIN */
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password
        })

      if (authError) {
        console.error('[AUTH ERROR]', authError)
        alert(`Authentication failed: ${authError.message}`)
        return
      }

      const user = authData?.user
      if (!user) {
        console.error('[AUTH ERROR] No user returned')
        alert('Login failed: No user session created')
        return
      }

      console.log('[AUTH SUCCESS] User ID:', user.id)

      /* 2️⃣ FETCH COMPANY RECORD */
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (companyError) {
        console.error('[COMPANY FETCH ERROR]', companyError)

        // RLS or missing row
        alert(
          companyError.code === 'PGRST116'
            ? 'Company record not found. Did you complete signup?'
            : `Company fetch failed: ${companyError.message}`
        )

        await supabase.auth.signOut()
        return
      }

      if (!company) {
        console.error('[COMPANY ERROR] Company row is null')
        alert('Company account not found')
        await supabase.auth.signOut()
        return
      }

      console.log('[COMPANY FOUND]', company)

      /* 3️⃣ OPTIONAL ROLE CHECK (DEFENSIVE) */
      if (company.role && company.role !== 'company') {
        console.error('[ROLE ERROR] Invalid role:', company.role)
        alert('Access denied: Not a company account')
        await supabase.auth.signOut()
        return
      }

      /* ✅ SUCCESS */
      console.log('[LOGIN SUCCESS] Redirecting to dashboard')
      router.push('/company/dashboard')
    } catch (err) {
      console.error('[UNEXPECTED LOGIN ERROR]', err)
      alert(
        'Unexpected login error:\n' +
          (err?.message || JSON.stringify(err))
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30, maxWidth: 400 }}>
      <h1>Company Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', margin: '10px 0', padding: 8 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', margin: '10px 0', padding: 8 }}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ width: '100%', padding: 10 }}
      >
        {loading ? 'Logging in…' : 'Login'}
      </button>

      <p style={{ marginTop: 20 }}>
        Don&apos;t have an account?{' '}
        <a href="/company/signup">Signup here</a>
      </p>
    </div>
  )
}
