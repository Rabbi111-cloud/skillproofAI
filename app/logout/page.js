'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function Logout() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      router.replace('/')
    })
  }, [router])

  return <p>Logging out…</p>
}
