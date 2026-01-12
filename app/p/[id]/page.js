'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient' // fixed import path
import { questions } from '../../assessment/questions' // fixed import path

export default function ProfilePage() {
  const { id } = useParams() // this should be the profile's user_id
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError('')

        if (!id) {
          setError('Invalid profile ID')
          return
        }

        // 1️⃣ Fetch profile by user_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // 2️⃣ Fetch submissions for this user
        const { data: submissions, error: subError } = await supabase
          .from('submissions')
          .select('question_id, is_correct')
          .eq('user_id', profileData.user_id) // ensure this matches profile
          
        if (subError) throw subError

        // 3️⃣ Build skill percentages
        const skillStats = {}
        submissions.forEach(sub => {
          const q = questions.find(q => q.id === sub.question_id)
          if (!q) return
          const skill = q.skill
          if (!skillStats[skill]) skillStats[skill] = { total: 0, correct: 0 }
          skillStats[skill].total += 1
          if (sub.is_correct) skillStats[skill].correct += 1
        })

        const skillPercentages = {}
        Object.entries(skillStats).forEach(([skill, stat]) => {
          skillPercentages[skill] = Math.round((stat.correct / stat.total) * 100)
        })

        setSkills(skillPercentages)

      } catch (err) {
        console.error('PROFILE PAGE ERROR:', err)
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

  const { email, score } = profile

  let level = 'Very Bad'
  if (score >= 80) level = 'Excellent'
  else if (score >= 60) level = 'Good'
  else if (score >= 40) level = 'Average'

  return (
    <div style={{ padding: 30 }}>
      <h2>Candidate Profile</h2>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Score:</strong> {score}</p>
      <p><strong>Level:</strong> {level}</p>

      {Object.keys(skills).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Skill Breakdown</h3>
          <ul>
            {Object.entries(skills).map(([skill, percent]) => (
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
