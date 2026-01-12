'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function ProfilePage() {
  const { id } = useParams() // user's ID from the URL
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

  /**
   * ✅ SAFE SKILLS FILTER (FIX)
   * - Allows all valid skills
   * - Blocks empty / invalid values
   * - Does NOT remove real categories like System Design, APIs, etc.
   */
  const filteredSkills = {}

  if (skills && typeof skills === 'object') {
    Object.entries(skills).forEach(([skill, value]) => {
      if (
        typeof skill === 'string' &&
        skill.trim() !== '' &&
        typeof value === 'number'
      ) {
        filteredSkills[skill] = value
      }
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
          <ul style={{ paddingLeft: 20 }}>
            {Object.entries(filteredSkills).map(([skill, percent]) => (
              <li key={skill}>
                <strong>{skill}</strong>: {percent}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
