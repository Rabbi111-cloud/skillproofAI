'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    try {
      console.log('[LOGIN] Attempt')

      /* AUTH */
      const { data, error } =
        await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error('[AUTH ERROR]', error)
        throw error
      }

      const user = data.user
      if (!user) throw new Error('No auth user returned')

      /* VERIFY COMPANY */
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (companyError) {
        console.error('[COMPANY FETCH ERROR]', companyError)
        throw new Error('Not a company account')
      }

      console.log('[LOGIN SUCCESS]')
      router.push('/company/dashboard')

    } catch (err) {
      console.error('[LOGIN FAILED]', err)
      alert(err.message)
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Company Login</h1>

      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password}
        onChange={e => setPassword(e.target.value)} />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in…' : 'Login'}
      </button>
    </div>
  )
}
