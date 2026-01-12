'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Calculating score...')
  const [skillsDisplay, setSkillsDisplay] = useState({})

  useEffect(() => {
    async function calculateAndSave() {
      try {
        console.log('RESULT PAGE STARTED')

        // 1️⃣ Get logged-in user
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError

        const user = authData?.user
        if (!user) {
          router.push('/login')
          return
        }

        // 2️⃣ Get answers from localStorage
        const answers = JSON.parse(localStorage.getItem('answers')) || {}

        let totalCorrect = 0
        const skillStats = {}

        // 3️⃣ Calculate scores and skill stats
        for (let q of questions) {
          const skillName = q.skill || 'General'
          if (!skillStats[skillName]) skillStats[skillName] = { correct: 0, total: 0 }
          skillStats[skillName].total += 1

          const userAnswer = answers[q.id]
          if (userAnswer && q.correct && userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim()) {
            totalCorrect += 1
            skillStats[skillName].correct += 1
          }

          // ✅ Insert each answer into submissions with correct foreign key
          await supabase.from('submissions').insert({
            user_id: user.id,
            question_id: Number(q.id),
            is_correct: userAnswer && q.correct && userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim()
          })
        }

        // 4️⃣ Calculate skill percentages
        const skills = {}
        Object.entries(skillStats).forEach(([skill, stat]) => {
          skills[skill] = Math.round((stat.correct / stat.total) * 100)
        })

        setSkillsDisplay(skills)

        // 5️⃣ Calculate total score
        const totalScore = Math.round((totalCorrect / questions.length) * 100)

        // 6️⃣ Upsert profile (insert if missing, update if exists)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            score: totalScore,
            skills,
            email: user.email
          })
          .select()
          .single()

        if (profileError) throw profileError
        console.log('PROFILE SAVED:', profileData)

        // 7️⃣ Cleanup & redirect
        localStorage.removeItem('answers')
        setStatus('Done! Redirecting...')
        router.push('/dashboard')

      } catch (err) {
        console.error('RESULT PAGE ERROR FULL:', err)
        setStatus(`Error calculating score: ${err.message || JSON.stringify(err)}`)
      }
    }

    calculateAndSave()
  }, [router])

  return (
    <div style={{ padding: 30, fontSize: 18 }}>
      <p>{status}</p>
      {Object.keys(skillsDisplay).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Skill Breakdown</h3>
          <ul>
            {Object.keys(skillsDisplay).map(skill => (
              <li key={skill}>
                {skill}: {skillsDisplay[skill]}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
