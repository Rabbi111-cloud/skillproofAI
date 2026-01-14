'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { questions } from '../assessment/questions'

export default function CandidateDashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [skills, setSkills] = useState({})

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        // 1️⃣ Get authenticated user
        const { data: authData } = await supabase.auth.getUser()
        if (!authData?.user) {
          router.replace('/login')
          return
        }

        const userId = authData.user.id

        // 2️⃣ Fetch profile
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (profileError || !data) throw new Error('Profile not found')

        if (data.role !== 'candidate') {
          router.replace('/company/dashboard')
          return
        }

        setProfile(data)

        // 3️⃣ Fetch or compute skills breakdown
        let skillPercentages = data.skills || {}

        if (!skillPercentages || Object.keys(skillPercentages).length === 0) {
          const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select('question_id, is_correct')
            .eq('user_id', userId)

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

            // ✅ Update profile table with computed skills
            await supabase
              .from('profiles')
              .update({ skills: skillPercentages })
              .eq('user_id', userId)
          }
        }

        setSkills(skillPercentages)
      } catch (err) {
        console.error('Candidate Dashboard Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>
  if (error)
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.replace('/login')}>Login</button>
      </div>
    )

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', padding: 40 }}>
      <div style={container}>
        <h1>Candidate Dashboard</h1>
        <p style={{ color: '#64748b' }}>Welcome, {profile.email}</p>

        {profile.assessment_completed ? (
          <div style={card}>
            <h2>Assessment Completed ✅</h2>
            <div style={score}>{profile.score}%</div>

            <h3>Skill Breakdown</h3>
            {Object.keys(skills).length > 0 ? (
              <ul style={skillList}>
                {Object.entries(skills).map(([skill, percent]) => (
                  <li key={skill}>
                    <strong>{skill}</strong>: {percent}%
                  </li>
                ))}
              </ul>
            ) : (
              <p>No skill breakdown available</p>
            )}

            <div style={{ marginTop: 20 }}>
              <button
                style={primaryBtn}
                onClick={() => router.push(`/p/${profile.user_id}`)}
              >
                View Profile
              </button>
              <button
                style={{ ...secondaryBtn, marginLeft: 10 }}
                onClick={() => window.open(`/p/${profile.user_id}`, '_blank')}
              >
                Share Profile
              </button>
            </div>
          </div>
        ) : (
          <button style={primaryBtn} onClick={() => router.push('/assessment/1')}>
            Take Assessment
          </button>
        )}

        <button
          style={{ ...dangerBtn, marginTop: 30 }}
          onClick={() => router.push('/logout')}
        >
          Logout
        </button>
      </div>
    </main>
  )
}

/* ===== STYLES ===== */

const container = { maxWidth: 900, margin: '0 auto' }

const card = {
  background: '#fff',
  padding: 30,
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  marginTop: 30
}

const score = {
  fontSize: 42,
  fontWeight: 'bold',
  color: '#2563eb',
  margin: '20px 0'
}

const skillList = {
  background: '#020617',
  color: '#e5e7eb',
  padding: 15,
  borderRadius: 8
}

const primaryBtn = {
  padding: '10px 18px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer'
}

const secondaryBtn = {
  ...primaryBtn,
  background: '#e5e7eb',
  color: '#111827'
}

const dangerBtn = {
  ...primaryBtn,
  background: '#dc2626'
}
