'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function AssessmentResult() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)

  useEffect(() => {
    async function calculateAndSave() {
      // 1️⃣ Get stored answers
      const storedAnswers = JSON.parse(
        localStorage.getItem('answers') || '{}'
      )

      // 2️⃣ Calculate score
      let finalScore = 0

      questions.forEach(q => {
        if (storedAnswers[q.id]?.toLowerCase() === q.correct.toLowerCase()) {
          finalScore += 10 // adjust if you want
        }
      })

      setScore(finalScore)

      // 3️⃣ Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('Not authenticated')
        router.push('/')
        return
      }

      // 4️⃣ Save submission
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          score: finalScore,
        })

      if (submissionError) {
        console.error(submissionError)
      }

      // 5️⃣ UPSERT profile (CRITICAL)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          score: finalScore,
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error(profileError)
      }

      // 6️⃣ Clear answers & redirect
      localStorage.removeItem('answers')
      setLoading(false)

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }

    calculateAndSave()
  }, [])

  if (loading) {
    return <p style={{ padding: 30 }}>Calculating your score...</p>
  }

  return (
    <main style={{ padding: 30 }}>
      <h2>Assessment Completed 🎉</h2>
      <p><strong>Your Score:</strong> {score}</p>
      <p>Redirecting to dashboard...</p>
    </main>
  )
}
