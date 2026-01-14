'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../../assessment/questions'

export default function ProfilePage() {
  const { id } = useParams() // this is the user's auth.id
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

        if (profileError || !profileData) {
          throw new Error('Profile not found')
        }

        setProfile(profileData)

        // 2️⃣ Determine skills
        let skillPercentages = profileData.skills || {}

        // If no skill breakdown, compute from submissions
        if (!skillPercentages || Object.keys(skillPercentages).length === 0) {
          const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select('question_id, is_correct')
            .eq('user_id', profileData.user_id)

          if (!subError && submissions?.length) {
            const skillStats = {}

            submissions.forEach(sub => {
              const q = questions.find(
                qItem => String(qItem.id) === String(sub.question_id)
              )
              if (!q) return

              const skill = q.skill || 'Unknown'
              if (!skillStats[skill]) skillStats[skill] = { total: 0, correct: 0 }

              skillStats[skill].total += 1
              if (sub.is_correct) skillStats[skill].correct += 1
            })

            skillPercentages = {}
            Object.entries(skillStats).forEach(([skill, stat]) => {
              skillPercentages[skill] = Math.round((stat.correct / stat.total) * 100)
            })

            // ✅ Optionally update profile in Supabase with computed skills
            await supabase
              .from('profiles')
              .update({ skills: skillPercentages })
              .eq('user_id', profileData.user_id)
          } else {
            skillPercentages = {} // fallback
          }
        }

        setSkills(skillPercentages)
      } catch (err) {
        console.error('PROFILE PAGE ERROR:', err)
        setError(err.message || 'Failed to load profile')
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

  // Determine level
  let level = 'Very Bad'
  if (score >= 80) level = 'Excellent'
  else if (score >= 60) level = 'Good'
  else if (score >= 40) level = 'Average'

  return (
    <div style={{ padding: 30 }}>
      <h2>Candidate Profile</h2>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Score:</strong> {score ?? 'N/A'}</p>
      <p><strong>Level:</strong> {level}</p>

      {Object.keys(skills).length > 0 ? (
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
      ) : (
        <p>No skill breakdown available</p>
      )}
    </div>
  )
}
