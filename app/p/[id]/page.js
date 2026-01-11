'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function ProfilePage() {
  const { id } = useParams() // user's ID from the URL
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        setError('')

        if (!id) {
          setError('Invalid profile ID')
          return
        }

        // Fetch profile from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .single()

        if (error) {
          console.error('PROFILE FETCH ERROR:', error)
          setError('Profile not found')
          return
        }

        setProfile(data)
      } catch (err) {
        console.error('PROFILE PAGE ERROR:', err)
        setError('Unexpected error loading profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  if (loading) return <p style={{ padding: 30 }}>Loading profile...</p>
  if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>
  if (!profile) return null

  const { email, score, skills } = profile

  // Determine level based on score
  let level = 'Unknown'
  if (score >= 80) level = 'Excellent'
  else if (score >= 60) level = 'Good'
  else if (score >= 40) level = 'Average'
  else level = 'Very Bad'

  // Filter out invalid or empty skills
  const filteredSkills = {}
  if (skills && typeof skills === 'object') {
    Object.keys(skills)
      .filter(skill => skill && skill !== 'undefined' && skill !== 'General')
      .forEach(skill => {
        filteredSkills[skill] = skills[skill]
      })
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Candidate Profile</h2>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Score:</strong> {score}</p>
      <p><strong>Level:</strong> {level}</p>

      {Object.keys(filteredSkills).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Skill Breakdown</h3>
          <ul>
            {Object.keys(filteredSkills).map(skill => (
              <li key={skill}>
                {skill}: {filteredSkills[skill]}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
