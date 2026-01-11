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
      // 1️⃣ Get logged-in user
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user

      if (!user) {
        router.push('/')
        return
      }

      // 2️⃣ Get answers
      const answers =
        JSON.parse(localStorage.getItem('answers')) || {}

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
          (skillStats[skill].correct /
            skillStats[skill].total) * 100
        )
      })

      // 4️⃣ Save submission
      await supabase.from('submissions').upsert({
        user_id: user.id,
        score: totalScore
      })

      // 5️⃣ Save profile
      await supabase
        .from('profiles')
        .update({
          score: totalScore,
          skills,
          email: user.email
        })
        .eq('user_id', user.id)

      // 6️⃣ Cleanup & redirect
      localStorage.removeItem('answers')
      setStatus('Done!')
      router.push('/dashboard')
    }

    calculateAndSave()
  }, [])

  return <p style={{ padding: 30 }}>{status}</p>
}
