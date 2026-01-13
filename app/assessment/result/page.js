'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Calculating score...')
  const [skillsDisplay, setSkillsDisplay] = useState({})
  const [totalScore, setTotalScore] = useState(null)
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
        const rawAnswers = JSON.parse(localStorage.getItem('answers')) || {}

        // normalize keys to numbers
        const answers = {}
        Object.keys(rawAnswers).forEach(k => {
          answers[Number(k)] = rawAnswers[k]
        })

        const answeredIds = Object.keys(answers)

        // 🚨 HARD STOP: no answers = no result
        if (answeredIds.length === 0) {
          router.push('/assessment/1')
          return
        }

        let correctCount = 0
        const skillStats = {}
        const submissionsToInsert = []

        // 3️⃣ Process ONLY answered questions
        questions.forEach(q => {
          const userAnswer = answers[q.id]
          if (!userAnswer) return

          const skill = q.skill || 'General'
          if (!skillStats[skill]) {
            skillStats[skill] = { correct: 0, total: 0 }
          }

          skillStats[skill].total += 1

          const isCorrect =
            q.correct &&
            userAnswer.trim().toLowerCase() ===
              q.correct.trim().toLowerCase()

          if (isCorrect) {
            correctCount += 1
            skillStats[skill].correct += 1
          }

          submissionsToInsert.push({
            user_id: user.id,
            question_id: Number(q.id),
            is_correct: !!isCorrect
          })
        })

        // 🚨 SAFETY CHECK
        if (submissionsToInsert.length === 0) {
          router.push('/assessment/1')
          return
        }

        // 4️⃣ Insert submissions
        const { error: subError } = await supabase
          .from('submissions')
          .insert(submissionsToInsert)

        if (subError) throw subError

        // 5️⃣ Skill breakdown
        const skills = {}
        Object.entries(skillStats).forEach(([skill, stat]) => {
          skills[skill] = Math.round(
            (stat.correct / stat.total) * 100
          )
        })

        setSkillsDisplay(skills)

        // 6️⃣ Final score (NO NaN POSSIBLE)
        const finalScore = Math.round(
          (correctCount / submissionsToInsert.length) * 100
        )

        setTotalScore(finalScore)

        // 7️⃣ Save profile
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
        setStatus(`Error calculating score`)
      }
    }

    calculateAndSave()
  }, [router])

  return (
    <div style={{ padding: 30 }}>
      <h2>Result</h2>
      <p>{status}</p>

      {done && totalScore !== null && (
        <>
          <p><strong>Total Score:</strong> {totalScore}%</p>

          <h3>Skill Breakdown</h3>
          <ul>
            {Object.entries(skillsDisplay).map(([skill, value]) => (
              <li key={skill}>
                {skill}: {value}%
              </li>
            ))}
          </ul>

          <button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </button>
        </>
      )}
    </div>
  )
}
