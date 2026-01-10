'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function AssessmentResult() {
  const router = useRouter()
  const [score, setScore] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function runResultFlow() {
      try {
        // 1️⃣ Validate questions
        if (!questions || questions.length === 0) {
          throw new Error('Questions not loaded')
        }

        // 2️⃣ Get stored answers
        const storedAnswers = JSON.parse(
          localStorage.getItem('answers') || '{}'
        )

        let finalScore = 0

        questions.forEach(q => {
          const userAnswer = storedAnswers[q.id]
          if (
            userAnswer &&
            q.correct &&
            userAnswer.toLowerCase() === q.correct.toLowerCase()
          ) {
            finalScore += 10
          }
        })

        // 3️⃣ Show score immediately
        setScore(finalScore)

        // 4️⃣ Get logged-in user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        // 5️⃣ Save submission
        await supabase.from('submissions').insert({
          user_id: user.id,
          score: finalScore,
        })

        // 6️⃣ Upsert profile
        await supabase.from('profiles').upsert({
          user_id: user.id,
          email: user.email,
          score: finalScore,
          updated_at: new Date().toISOString(),
        })

        // 7️⃣ Cleanup & redirect
        localStorage.removeItem('answers')

        setTimeout(() => {
          router.push('/dashboard')
        }, 2500)
      } catch (err) {
        console.error(err)
        setError(err.message)
      }
    }

    runResultFlow()
  }, [])

  if (error) {
    return (
      <main style={{ padding: 30 }}>
        <h2>Error ❌</h2>
        <p>{error}</p>
      </main>
    )
  }

  if (score === null) {
    return (
      <main style={{ padding: 30 }}>
        <p>Calculating your score...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 30 }}>
      <h2>Assessment Completed 🎉</h2>
      <p><strong>Your Score:</strong> {score}</p>
      <p>Redirecting to dashboard...</p>
    </main>
  )
}
