'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Calculating score...')
  const [skillsDisplay, setSkillsDisplay] = useState({}) // optional: for showing filtered skills

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
        let skillStats = {}

        // 3️⃣ Calculate scores safely and handle undefined skills
        questions.forEach(q => {
          const skillName = q.skill || 'General' // default to 'General' if missing

          if (!skillStats[skillName]) {
            skillStats[skillName] = { correct: 0, total: 0 }
          }

          skillStats[skillName].total += 1

          const userAnswer = answers[q.id]
          const correctAnswer = q.correct

          if (userAnswer && correctAnswer) {
            if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
              totalCorrect += 1
              skillStats[skillName].correct += 1
            }
          }
        })

        const totalScore = Math.round((totalCorrect / questions.length) * 100)

        // 4️⃣ Convert skillStats to % and filter out undefined/empty keys
        const skills = {}
        Object.keys(skillStats)
          .filter(skill => skill && skill !== 'undefined') // remove undefined or empty
          .forEach(skill => {
            skills[skill] = Math.round(
              (skillStats[skill].correct / skillStats[skill].total) * 100
            )
          })

        console.log('SCORE:', totalScore)
        console.log('SKILLS (filtered):', skills)

        setSkillsDisplay(skills) // optional, can be used to display in your component

        // 5️⃣ Save submission
        const { data: submissionData, error: submissionError } = await supabase
          .from('submissions')
          .insert({
            user_id: user.id,
            score: totalScore
          })
          .select()
          .single()

        if (submissionError) throw submissionError
        console.log('SUBMISSION SAVED:', submissionData)

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
