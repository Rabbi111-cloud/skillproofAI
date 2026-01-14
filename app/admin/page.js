'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'diggingdeep0007@gmail.com'

export default function AdminDashboard() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadAdminData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      if (user.email !== ADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }

      // Fetch assessments + profile info
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          user_id,
          score,
          created_at,
          profiles (
            email
          )
        `)
        .order('score', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setResults(data || [])
      }

      setLoading(false)
    }

    loadAdminData()
  }, [router])

  if (loading) {
    return <p style={{ padding: 30 }}>Loading admin dashboard...</p>
  }

  return (
    <main style={{ padding: 40 }}>
      <h2>Admin / Company Dashboard</h2>

      {results.length === 0 ? (
        <p>No candidates yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Score</th>
              <th>Level</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {results.map(item => {
              let level = 'Average'
              if (item.score >= 80) level = 'Strong'
              if (item.score >= 90) level = 'Excellent'

              return (
                <tr key={item.user_id}>
                  <td>{item.profiles?.email || 'N/A'}</td>
                  <td>{item.score}</td>
                  <td>{level}</td>
                  <td>
                    <a
                      href={`/p/${item.user_id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Profile
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </main>
  )
}
