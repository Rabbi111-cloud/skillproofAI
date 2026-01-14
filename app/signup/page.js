'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function CandidateSignup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // ✅ Prevent admin email signup
    if (email.toLowerCase() === 'diggingdeep0007@gmail.com') {
      setError('This email is reserved for admin.')
      setLoading(false)
      return
    }

    try {
      // 1️⃣ Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })

      if (signUpError) throw signUpError

      // 2️⃣ Insert profile row
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ user_id: data.user.id, email, role: 'candidate' }])

      if (profileError) throw profileError

      // 3️⃣ Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 500, margin: '0 auto' }}>
      <h1>Candidate Signup</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form
        onSubmit={handleSignup}
        style={{ display: 'flex', flexDirection: 'column', gap: 15 }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Signing up…' : 'Sign Up'}
        </button>
      </form>
    </main>
  )
}
