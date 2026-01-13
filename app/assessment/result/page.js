'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const ran = useRef(false)

  const [status, setStatus] = useState('Calculating score...')
  const [skillsDisplay, setSkillsDisplay] = useState({})
  const [totalScore, setTotalScore] = useState(null)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    async function calculateAndSave() {
      try {
        // 1️⃣ Auth
        const { data } = await supabase.auth.getUser()
        const user = data?.user
        if (!user) {
          router.push('/login')
          return
        }

        // 2️⃣ Load answers
        const rawAnswers =
          JSON.parse(localStorage.getItem('answers')) || {}

        let correctCount = 0
        const skillStats = {}
        const submissions = []

        questions.forEach(q => {
          const userAnswer = rawAnswers[q.id] ?? '' // ✅ FIX
          const skill = q.skill || 'General'

          if (!skillStats[skill]) {
            skillStats[skill] = { correct: 0, total: 0 }
          }

          skillStats[skill].total += 1

          const isCorrect =
            userAnswer.trim().toLowerCase() ===
            q.correct.trim().toLowerCase()

          if (isCorrect) {
            correctCount++
            skillStats[skill].correct++
          }

          submissions.push({
            user_id: user.id,
            question_id: Number(q.id),
            is_correct: isCorrect
          })
        })

        // 3️⃣ Save submissions
        await supabase.from('submissions').insert(submissions)

        // 4️⃣ Skill %
        const skills = {}
        Object.entries(skillStats).forEach(([skill, stat]) => {
          skills[skill] = Math.round(
            (stat.correct / stat.total) * 100
          )
        })

        setSkillsDisplay(skills)

        // 5️⃣ Final score
        const score = Math.round(
          (correctCount / questions.length) * 100
        )

        setTotalScore(score)

        // 6️⃣ Save profile
        await supabase.from('profiles').upsert(
          {
            user_id: user.id,
            score,
            skills,
            email: user.email
          },
          { onConflict: ['user_id'] }
        )

        localStorage.removeItem('answers')
        setStatus('Assessment complete!')
      } catch (err) {
        console.error(err)
        setStatus('Failed to calculate score')
      }
    }

    calculateAndSave()
  }, [router])

  return (
    <div style={{ padding: 30 }}>
      <h2>Assessment Result</h2>
      <p>{status}</p>

      {totalScore !== null && (
        <>
          <p><strong>Total Score:</strong> {totalScore}%</p>

          <h3>Skill Breakdown</h3>
          <ul>
            {Object.entries(skillsDisplay).map(([skill, val]) => (
              <li key={skill}>
                {skill}: {val}%
              </li>
            ))}
          </ul>

          <button
            style={{ marginTop: 20 }}
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </button>
        </>
      )}
    </div>
  )
}
