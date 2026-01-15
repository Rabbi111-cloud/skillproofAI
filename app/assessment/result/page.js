'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const [error, setError] = useState(null)

  useEffect(() => {
    async function submitAssessment() {
      try {
        // 1️⃣ Load answers
        const storedAnswers =
          JSON.parse(localStorage.getItem('answers')) || {}

        if (Object.keys(storedAnswers).length === 0) {
          throw new Error('No answers found')
        }

        // 2️⃣ Calculate score + skill stats
        let correctCount = 0
        const skillStats = {}

        questions.forEach(q => {
          const expected = (q.correct || '').trim().toLowerCase()
          const given = (storedAnswers[q.id] || '').trim().toLowerCase()

          const isCorrect = expected && given === expected
          if (isCorrect) correctCount++

          if (!skillStats[q.skill]) {
            skillStats[q.skill] = { correct: 0, total: 0 }
          }

          skillStats[q.skill].total += 1
          if (isCorrect) skillStats[q.skill].correct += 1
        })

        const score = Math.round(
          (correctCount / questions.length) * 100
        )

        // 3️⃣ Build breakdown (%)
        const breakdown = {}
        Object.entries(skillStats).forEach(([skill, stat]) => {
          breakdown[skill] = Math.round(
            (stat.correct / stat.total) * 100
          )
        })

        // 4️⃣ Get authenticated user
        const { data: authData, error: authError } =
          await supabase.auth.getUser()

        if (authError || !authData?.user) {
          throw new Error('User not authenticated')
        }

        const userId = authData.user.id

        // 5️⃣ ✅ SAVE TO *CORRECT* COLUMN
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            score,
            breakdown, // ✅ THIS WAS THE MISSING LINK
            assessment_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (updateError) throw updateError

        // 6️⃣ Cleanup + redirect
        localStorage.removeItem('answers')
        router.replace('/dashboard')

      } catch (err) {
        console.error('[ASSESSMENT SUBMIT ERROR]', err)
        setError(err.message || 'Failed to submit assessment')
      }
    }

    submitAssessment()
  }, [router])

  if (error) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Assessment Submission Failed</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    )
  }

  return <p style={{ padding: 30 }}>Submitting result…</p>
}
