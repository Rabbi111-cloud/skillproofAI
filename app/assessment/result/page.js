'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'

export default function ResultPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Calculating score...')
  const [skillsDisplay, setSkillsDisplay] = useState({})
  const [totalScore, setTotalScore] = useState(0)
  const [done, setDone] = useState(false)

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

        // 2️⃣ Get answers
        const answers = JSON.parse(localStorage.getItem('answers')) || {}

        let correctCount = 0
        const skillStats = {}

        // 3️⃣ Prepare all submissions to insert
        const submissionsToInsert = questions.map(q => {
          const skillName = q.skill || 'General'
          if (!skillStats[skillName]) skillStats[skillName] = { correct: 0, total: 0 }
          skillStats[skillName].total += 1

          const userAnswer = answers[q.id]
          const isCorrect =
            userAnswer &&
            q.correct &&
            userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim()

          if (isCorrect) skillStats[skillName].correct += 1
          if (isCorrect) correctCount += 1

          return {
            user_id: user.id,
            question_id: Number(q.id),
            is_correct: !!isCorrect
          }
        })

        // 4️⃣ Insert all submissions at once
        const { error: subError } = await supabase.from('submissions').insert(submissionsToInsert)
        if (subError) console.warn('Submission insert error:', subError.message)

        // 5️⃣ Calculate skill percentages
        const skills = {}
        Object.entries(skillStats).forEach(([skill, stat]) => {
          skills[skill] = Math.round((stat.correct / stat.total) * 100)
        })
        setSkillsDisplay(skills)

        // 6️⃣ Calculate total score
        const finalScore = Math.round((correctCount / questions.length) * 100)
        setTotalScore(finalScore)

        // 7️⃣ Upsert profile safely
        const { data: profileData, error: profileError } = await supabase
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
          .select()
          .single()

        if (profileError) throw profileError

        // 8️⃣ Done, let user see results
        setStatus('Assessment complete!')
        setDone(true)
        localStorage.removeItem('answers')
      } catch (err) {
        console.error('RESULT PAGE ERROR FULL:', err)
        setStatus(`Error calculating score: ${err.message || JSON.stringify(err)}`)
      }
    }

    calculateAndSave()
  }, [router])

  return (
    <div style={{ padding: 30, fontSize: 18 }}>
      <h2>Result Page</h2>
      <p>{status}</p>

      {done && (
        <>
          <p><strong>Total Score:</strong> {totalScore}%</p>
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

          <button
            style={{ marginTop: 20, padding: '10px 20px' }}
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </button>
        </>
      )}
    </div>
  )
}
