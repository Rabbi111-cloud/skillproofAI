'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function PublicProfile({ params }) {
  const { id } = params
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, score, updated_at')
        .eq('user_id', id)
        .single()

      if (!error) {
        setProfile(data)
      }

      setLoading(false)
    }

    loadProfile()
  }, [id])

  if (loading) {
    return <p style={{ padding: 30 }}>Loading profile...</p>
  }

  if (!profile) {
    return <p style={{ padding: 30 }}>Profile not found</p>
  }

  let level = 'Average'
  if (profile.score >= 80) level = 'Strong'
  if (profile.score >= 90) level = 'Excellent'

  return (
    <main style={{ padding: 40, maxWidth: 600, margin: 'auto' }}>
      <h2>Candidate Profile</h2>

      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Score:</strong> {profile.score}</p>
      <p><strong>Level:</strong> {level}</p>

      <hr />

      <p style={{ color: '#666' }}>
        Last updated: {new Date(profile.updated_at).toLocaleDateString()}
      </p>

      <p style={{ marginTop: 20 }}>
        📩 Interested in this candidate?  
        Contact them directly.
      </p>
    </main>
  )
}
