'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompanyDashboard() {
  const router = useRouter()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth?.user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', auth.user.id)
          .single()

        if (error) throw error

        setCompany(data)
      } catch (err) {
        console.error('[DASHBOARD ERROR]', err)
        router.push('/company/login')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  if (loading) return <p>Loading...</p>

  return (
    <main style={{ padding: 30 }}>
      <h1>{company.name}</h1>
      <p>{company.email}</p>

      <hr />

      <button onClick={() => router.push('/company/candidates')}>
        View Candidates
      </button>
    </main>
  )
}
