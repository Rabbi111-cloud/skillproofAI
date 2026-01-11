'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Calculating score...')

  useEffect(() => {
    async function calculateAndSave() {
      try {
        console.log('RESULT PAGE STARTED')

        // 1️⃣ Get logged-in user
        const { data: authData, error: authError } =
          await supabase.auth.getUser()

        if (authError) throw authError

        const user = authData?.user

        if (!user) {
          router.push('/login')
          return
        }

        // 2️⃣ Get answers from localStorage
        const answers = JSON.parse(localStorage.getItem('answers')) || {}

        let totalCorrect = 0
        let skillStats = {}

        // 3️⃣ Calculate scores
        questions.forEach(q => {
          if (!skillStats[q.skill]) {
            skillStats[q.skill] = { correct: 0, total: 0 }
          }

          skillStats[q.skill].total += 1

          if (
            answers[q.id]?.toLowerCase().trim() ===
            q.correct.toLowerCase().trim()
          ) {
            totalCorrect += 1
            skillStats[q.skill].correct += 1
          }
        })

        const totalScore = Math.round(
          (totalCorrect / questions.length) * 100
        )

        const skills = {}
        Object.keys(skillStats).forEach(skill => {
          skills[skill] = Math.round(
            (skillStats[skill].correct / skillStats[skill].total) * 100
          )
        })

        console.log('SCORE:', totalScore)
        console.log('SKILLS:', skills)

        // 4️⃣ Save submission
        const { error: submissionError } = await supabase
          .from('submissions')
          .insert({
            user_id: user.id, // ✅ Correct column name
            score: totalScore
          })

        if (submissionError) throw submissionError

        // 5️⃣ Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            score: totalScore,
            skills,
            email: user.email
          })
          .eq('user_id', user.id) // ✅ Correct column name

        if (profileError) throw profileError

        // 6️⃣ Cleanup & redirect
        localStorage.removeItem('answers')
        setStatus('Done! Redirecting...')
        router.push('/dashboard')
      } catch (err) {
        console.error('RESULT PAGE ERROR:', err)
        setStatus('Error calculating score. Please retry.')
      }
    }

    calculateAndSave()
  }, [router])

  return (
    <p style={{ padding: 30, fontSize: 18 }}>
      {status}
    </p>
  )
}
