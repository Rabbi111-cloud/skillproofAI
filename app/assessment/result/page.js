'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const [error, setError] = useState(null)

  useEffect(() => {
    async function submitResult() {
      try {
        // 1️⃣ Get answers
        const stored = JSON.parse(localStorage.getItem('answers'))
        if (!stored) throw new Error('No answers found')

        // 2️⃣ Score calculation
        let correctCount = 0
        const breakdown = {}

        questions.forEach(q => {
          const correct = q.answer.trim().toLowerCase()
          const given = (stored[q.id] || '').trim().toLowerCase()
          const isCorrect = given === correct

          if (isCorrect) correctCount++

          breakdown[q.id] = {
            correct: isCorrect
          }
        })

        const score = Math.round(
          (correctCount / questions.length) * 100
        )

        // 3️⃣ Get auth user (GUARDED)
        const { data: authData, error: authError } =
          await supabase.auth.getUser()

        if (authError || !authData?.user) {
          throw new Error('User not authenticated')
        }

        const userId = authData.user.id

        // 4️⃣ Update profile (GUARDED)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            score,
            breakdown,
            assessment_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (updateError) {
          throw updateError
        }

        // 5️⃣ Cleanup
        localStorage.removeItem('answers')

        // 6️⃣ Redirect
        router.replace('/dashboard')

      } catch (err) {
        console.error('Assessment submit failed:', err)
        setError(err.message)
      }
    }

    submitResult()
  }, [router])

  if (error) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Error submitting assessment</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.replace('/dashboard')}>
          Go to Dashboard
        </button>
      </div>
    )
  }

  return <p style={{ padding: 30 }}>Submitting result…</p>
}
