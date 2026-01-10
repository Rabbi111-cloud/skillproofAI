'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadProfiles() {
      // Ensure user is logged in
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user) {
        router.push('/')
        return
      }

      // Fetch all candidate profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, score, updated_at')
        .order('score', { ascending: false })

      if (!error) {
        setProfiles(data)
      } else {
        console.error(error)
      }

      setLoading(false)
    }

    loadProfiles()
  }, [])

  if (loading) {
    return <p style={{ padding: 30 }}>Loading admin dashboard...</p>
  }

  return (
    <main style={{ padding: 40 }}>
      <h2>Admin / Company Dashboard</h2>

      {profiles.length === 0 ? (
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
            {profiles.map(profile => {
              let level = 'Average'
              if (profile.score >= 80) level = 'Strong'
              if (profile.score >= 90) level = 'Excellent'

              return (
                <tr key={profile.user_id}>
                  <td>{profile.email}</td>
                  <td>{profile.score}</td>
                  <td>{level}</td>
                  <td>
                    <a
                      href={`/p/${profile.user_id}`}
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
