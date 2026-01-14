'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../../assessment/questions'

export default function ProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!id) return

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .single()

        if (error) throw error
        setProfile(profileData)

        let skillPercentages = profileData.skills || {}

        if (!Object.keys(skillPercentages).length) {
          const { data: submissions } = await supabase
            .from('submissions')
            .select('question_id, is_correct')
            .eq('user_id', id)

          const stats = {}
          submissions?.forEach(s => {
            const q = questions.find(q => q.id == s.question_id)
            if (!q) return
            stats[q.skill] ??= { total: 0, correct: 0 }
            stats[q.skill].total++
            if (s.is_correct) stats[q.skill].correct++
          })

          Object.entries(stats).forEach(([k, v]) => {
            skillPercentages[k] = Math.round((v.correct / v.total) * 100)
          })
        }

        setSkills(skillPercentages)
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [id])

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>
  if (error) return <p style={{ padding: 40, color: 'red' }}>{error}</p>

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', padding: 40 }}>
      <div style={card}>
        <h2>Candidate Profile</h2>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Score:</strong> {profile.score}%</p>

        <h3 style={{ marginTop: 20 }}>Skills</h3>
        {Object.entries(skills).map(([skill, percent]) => (
          <div key={skill} style={{ marginBottom: 10 }}>
            <strong>{skill}</strong>
            <div style={barBg}>
              <div style={{ ...barFill, width: `${percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

const card = {
  maxWidth: 700,
  margin: '0 auto',
  background: '#fff',
  padding: 30,
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
}

const barBg = {
  height: 10,
  background: '#e5e7eb',
  borderRadius: 6,
  overflow: 'hidden'
}

const barFill = {
  height: '100%',
  background: '#2563eb'
}
