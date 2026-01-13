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
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function run() {
      try {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth?.user) {
          router.push('/login')
          return
        }

        const user = auth.user
        setUserId(user.id)

        const answers = JSON.parse(localStorage.getItem('answers')) || {}

        let correct = 0
        const skillStats = {}

        questions.forEach(q => {
          const answer = answers[q.id]
          const attempted = typeof answer === 'string' && answer.trim().length > 0

          if (!skillStats[q.skill]) {
            skillStats[q.skill] = { total: 0, correct: 0 }
          }

          skillStats[q.skill].total += 1

          if (attempted && q.correct) {
            if (answer.toLowerCase().trim() === q.correct.toLowerCase().trim()) {
              correct += 1
              skillStats[q.skill].correct += 1
            }
          }
        })

        const finalScore = Math.round((correct / questions.length) * 100)

        const skillPercentages = {}
        Object.entries(skillStats).forEach(([skill, stat]) => {
          skillPercentages[skill] = Math.round((stat.correct / stat.total) * 100)
        })

        setScore(finalScore)
        setSkills(skillPercentages)

        // ✅ Save profile safely
        await supabase.from('profiles').upsert(
          {
            user_id: user.id,
            email: user.email,
            score: finalScore,
            skills: skillPercentages
          },
          { onConflict: ['user_id'] }
        )

        localStorage.removeItem('answers')
        setStatus('Assessment complete!')
        setDone(true)
      } catch (e) {
        setStatus('Error calculating score')
        console.error(e)
      }
    }

    run()
  }, [router])

  return (
    <div style={{ padding: 30 }}>
      <h2>Assessment Result</h2>
      <p>{status}</p>

      {done && (
        <>
          <p><strong>Total Score:</strong> {score}%</p>

          <h3>Skill Breakdown</h3>
          <ul>
            {Object.entries(skills).map(([skill, percent]) => (
              <li key={skill}>{skill}: {percent}%</li>
            ))}
          </ul>

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

            <button
              onClick={() => router.push('/dashboard')}
              style={{ marginLeft: 10 }}
            >
              Back to Dashboard
            </button>
          </div>
        </>
      )}
    </div>
  )
}
