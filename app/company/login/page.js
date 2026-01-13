'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) {
      alert('Email and password are required')
      return
    }

    setLoading(true)

    try {
      // 1️⃣ Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        alert(error.message)
        return
      }

      const user = data.user
      if (!user) {
        alert('Authentication failed')
        return
      }

      // 2️⃣ CHECK IF USER IS ALREADY A CANDIDATE
      const { data: existingProfile, error: profileFetchError } =
        await supabase
          .from('profiles')
          .select('role, score, skills')
          .eq('user_id', user.id)
          .single()

      if (profileFetchError && profileFetchError.code !== 'PGRST116') {
        alert('Profile check failed')
        await supabase.auth.signOut()
        return
      }

      // 🚫 BLOCK CANDIDATES
      if (
        existingProfile &&
        (
          existingProfile.role === 'candidate' ||
          typeof existingProfile.score === 'number' ||
          existingProfile.skills
        )
      ) {
        alert(
          'Access denied: Candidate accounts cannot log in as companies.'
        )
        await supabase.auth.signOut()
        return
      }

      // 3️⃣ ENSURE COMPANY EXISTS
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!company) {
        const { error: createCompanyError } = await supabase
          .from('companies')
          .insert({
            id: user.id,
            email: user.email,
            name: user.email.split('@')[0]
          })

        if (createCompanyError) {
          alert(`Company creation failed: ${createCompanyError.message}`)
          await supabase.auth.signOut()
          return
        }
      }

      // 4️⃣ UPSERT COMPANY PROFILE
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            role: 'company',
            company_id: user.id
          },
          { onConflict: ['user_id'] }
        )

      if (upsertError) {
        alert(`Profile setup failed: ${upsertError.message}`)
        await supabase.auth.signOut()
        return
      }

      // 5️⃣ SUCCESS
      router.push('/company/dashboard')
    } catch (err) {
      alert(`Company login failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Login</h1>

      <input
        type="email"
        placeholder="Company Email"
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
        onClick={handleLogin}
        disabled={loading}
        style={{ padding: '6px 12px', marginTop: 10 }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  )
}
