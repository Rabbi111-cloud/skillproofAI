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
        // Fetch full_name in addition to existing fields
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, score, breakdown')
          .eq('user_id', id)
          .single()

        if (error || !data) {
          throw new Error('Profile not found')
        }

        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) loadProfile()
  }, [id])

  if (loading) return <p style={{ padding: 30 }}>Loading profile…</p>
  if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>

  const { full_name, email, score, breakdown } = profile

  return (
    <div style={{ padding: 30 }}>
      <h2>Candidate Profile</h2>
      <p><strong>Full Name:</strong> {full_name || 'N/A'}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Score:</strong> {score ?? 'N/A'}%</p>

      <h3>Skill Breakdown</h3>

      {!breakdown || Object.keys(breakdown).length === 0 ? (
        <p>No skill breakdown available</p>
      ) : (
        <ul>
          {Object.entries(breakdown).map(([skill, percent]) => (
            <li key={skill}>
              <strong>{skill}</strong>: {percent}%
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
