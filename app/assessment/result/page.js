'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Calculating score...')
  const [skillsDisplay, setSkillsDisplay] = useState({})
  const [totalScore, setTotalScore] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function calculateAndSave() {
      try {
        // 1️⃣ Auth
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        if (!user) {
          router.push('/login')
          return
        }

        // 2️⃣ Answers
        const answers = JSON.parse(localStorage.getItem('answers')) || {}
        const answeredQuestionIds = Object.keys(answers)

        // 🚨 CRITICAL GUARD — no answers, no scoring
        if (answeredQuestionIds.length === 0) {
          router.push('/assessment/1')
          return
        }

        let correctCount = 0
        const skillStats = {}
        const submissionsToInsert = []

        // 3️⃣ Only process ANSWERED questions
        questions.forEach(q => {
          const userAnswer = answers[q.id]
          if (!userAnswer) return

          const skillName = q.skill || 'General'
          if (!skillStats[skillName]) {
            skillStats[skillName] = { correct: 0, total: 0 }
          }

          skillStats[skillName].total += 1

          const isCorrect =
            q.correct &&
            userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim()

          if (isCorrect) {
            skillStats[skillName].correct += 1
            correctCount += 1
          }

          submissionsToInsert.push({
            user_id: user.id,
            question_id: Number(q.id),
            is_correct: !!isCorrect
          })
        })

        // 4️⃣ Insert submissions (only answered)
        const { error: subError } = await supabase
          .from('submissions')
          .insert(submissionsToInsert)

        if (subError) throw subError

        // 5️⃣ Skill percentages
        const skills = {}
        Object.entries(skillStats).forEach(([skill, stat]) => {
          skills[skill] = Math.round((stat.correct / stat.total) * 100)
        })

        setSkillsDisplay(skills)

        // 6️⃣ Score based on answered questions
        const finalScore = Math.round(
          (correctCount / submissionsToInsert.length) * 100
        )

        setTotalScore(finalScore)

        // 7️⃣ Save profile ONLY NOW
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              user_id: user.id,
              score: finalScore,
              skills,
              email: user.email
            },
            { onConflict: ['user_id'] }
          )

        if (profileError) throw profileError

        localStorage.removeItem('answers')
        setStatus('Assessment complete!')
        setDone(true)
      } catch (err) {
        console.error(err)
        setStatus(`Error calculating score: ${err.message}`)
      }
    }

    calculateAndSave()
  }, [router])

  return (
    <div style={{ padding: 30 }}>
      <h2>Result Page</h2>
      <p>{status}</p>

      {done && (
        <>
          <p><strong>Total Score:</strong> {totalScore}%</p>

          {Object.keys(skillsDisplay).length > 0 && (
            <div>
              <h3>Skill Breakdown</h3>
              <ul>
                {Object.entries(skillsDisplay).map(([skill, value]) => (
                  <li key={skill}>
                    {skill}: {value}%
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </button>
        </>
      )}
    </div>
  )
}
