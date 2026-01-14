'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()

  useEffect(() => {
    async function submitResult() {
      const stored = JSON.parse(localStorage.getItem('answers')) || {}

      let score = 0
      const breakdown = {}

      questions.forEach(q => {
        const correct = q.answer.trim().toLowerCase()
        const given = (stored[q.id] || '').trim().toLowerCase()

        if (given === correct) score += 1

        breakdown[q.id] = {
          correct: given === correct
        }
      })

      const finalScore = Math.round((score / questions.length) * 100)

      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user.id

      // ✅ THIS UPDATE MUST BE USER-SCOPED
      await supabase
        .from('profiles')
        .update({
          score: finalScore,
          breakdown,
          assessment_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      localStorage.removeItem('answers')
      router.replace('/dashboard')
    }

    submitResult()
  }, [router])

  return <p style={{ padding: 30 }}>Submitting result…</p>
}
