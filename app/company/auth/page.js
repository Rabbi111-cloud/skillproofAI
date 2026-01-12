'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanyAuthPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [mode, setMode] = useState('login') // login | signup
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      if (mode === 'signup') {
        // 1️⃣ Sign up the company in Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // 2️⃣ Insert into companies table
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            id: data.user.id,
            name: companyName,
            email
          })
          .select()
          .single()

        if (companyError) throw companyError

        // 3️⃣ Create a profile for the company
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          email,
          role: 'company',
          company_id: companyData.id
        })

        if (profileError) throw profileError

        alert('Signup successful! You can now login.')
        setMode('login') // switch to login after signup
      } else {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        // Fetch profile to confirm it's a company
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single()

        if (profileError || !profile || profile.role !== 'company') {
          await supabase.auth.signOut()
          throw new Error('Access denied: Not a company account')
        }

        // Redirect to company dashboard
        router.push('/company/dashboard')
      }
    } catch (err) {
      alert(err.message || JSON.stringify(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30, maxWidth: 400, margin: '0 auto' }}>
      <h1>{mode === 'login' ? 'Company Login' : 'Company Signup'}</h1>

      {mode === 'signup' && (
        <input
          placeholder="Company Name"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      >
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Signup'}
      </button>

      <p style={{ textAlign: 'center', cursor: 'pointer', color: '#0070f3' }}
         onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login'
          ? "Don't have an account? Signup"
          : 'Already have an account? Login'}
      </p>
    </div>
  )
}
