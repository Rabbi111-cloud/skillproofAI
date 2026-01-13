'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Calculating score...')
  const [skills, setSkills] = useState({})
  const [score, setScore] = useState(0)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    async function run() {
      try {
        // 1️⃣ Get logged-in user
        const { data: auth, error: authError } = await supabase.auth.getUser()
        if (authError || !auth?.user) {
          router.push('/login')
          return
        }
        const user = auth.user
        setUserId(user.id)

        // 2️⃣ Get answers from localStorage
        const answers = JSON.parse(localStorage.getItem('answers')) || {}

        // 3️⃣ Calculate score and skills
        let correctCount = 0
        const skillStats = {}

        questions.forEach(q => {
          const userAnswer = answers[q.id] || ''
          const attempted = userAnswer.trim().length > 0

          if (!skillStats[q.skill]) skillStats[q.skill] = { total: 0, correct: 0 }
          skillStats[q.skill].total += 1

          // Only count as correct if user typed the correct answer exactly
          if (attempted && userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim()) {
            correctCount += 1
            skillStats[q.skill].correct += 1
          }
        })

        const finalScore = Math.round((correctCount / questions.length) * 100)

        const skillPercentages = {}
        Object.entries(skillStats).forEach(([skill, stat]) => {
          skillPercentages[skill] = Math.round((stat.correct / stat.total) * 100)
        })

        setScore(finalScore)
        setSkills(skillPercentages)

        // 4️⃣ Save profile with skills JSON
        const { data: profileData, error: profileError } = await supabase.from('profiles').upsert(
          {
            user_id: user.id,
            email: user.email,
            score: finalScore,
            skills: skillPercentages // MUST be JSON
          },
          { onConflict: ['user_id'] }
        ).select().single()

        if (profileError) throw profileError

        // 5️⃣ Clear answers and mark done
        localStorage.removeItem('answers')
        setStatus('Assessment complete!')
      } catch (err) {
        console.error('Result page error:', err)
        setStatus(`Error calculating score: ${err.message || JSON.stringify(err)}`)
      }
    }

    run()
  }, [router])

  return (
    <div style={{ padding: 30 }}>
      <h2>Assessment Result</h2>
      <p>{status}</p>

      {status === 'Assessment complete!' && (
        <>
          <p><strong>Total Score:</strong> {score}%</p>

          {Object.keys(skills).length > 0 && (
            <>
              <h3>Skill Breakdown</h3>
              <ul>
                {Object.entries(skills).map(([skill, percent]) => (
                  <li key={skill}>{skill}: {percent}%</li>
                ))}
              </ul>
            </>
          )}

          <div style={{ marginTop: 20 }}>
            <button onClick={() => router.push(`/p/${userId}`)}>
              View Profile
            </button>

            <button
              onClick={() => window.open(`/p/${userId}`, '_blank')}
              style={{ marginLeft: 10 }}
            >
              Share Profile
            </button>
          </div>
        </>
      )}
    </div>
  )
}
