'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function ProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email, score, skills')
          .eq('user_id', id)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (e) {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (id) loadProfile()
  }, [id])

  if (loading) return <p style={{ padding: 30 }}>Loading profile...</p>
  if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>
  if (!profile) return null

  const { email, score, skills = {} } = profile

  let level = 'Very Bad'
  if (score >= 80) level = 'Excellent'
  else if (score >= 60) level = 'Good'
  else if (score >= 40) level = 'Average'

  return (
    <div style={{ padding: 30 }}>
      <h2>Candidate Profile</h2>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Score:</strong> {score}%</p>
      <p><strong>Level:</strong> {level}</p>

      {Object.keys(skills).length > 0 && (
        <>
          <h3>Skill Breakdown</h3>
          <ul>
            {Object.entries(skills).map(([skill, percent]) => (
              <li key={skill}>
                <strong>{skill}</strong>: {percent}%
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
