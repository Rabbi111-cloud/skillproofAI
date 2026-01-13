'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (profile?.role === 'company') {
        router.replace('/company/dashboard')
      } else {
        router.replace('/dashboard')
      }
    }

    redirect()
  }, [router])

  return <p style={{ padding: 30 }}>Redirecting…</p>
}
