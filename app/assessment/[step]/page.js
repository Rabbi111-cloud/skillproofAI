'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { questions } from '../questions'

const TOTAL_TIME = 30

export default function StepPage() {
  const router = useRouter()
  const { step } = useParams()

  const [index, setIndex] = useState(Number(step) || 0)
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const moved = useRef(false)

  const question = questions[index]

  // ✅ keep index synced with URL
  useEffect(() => {
    setIndex(Number(step) || 0)
  }, [step])

  // ✅ reset state per question
  useEffect(() => {
    if (!question) return

    moved.current = false
    setTimeLeft(TOTAL_TIME)

    const saved = JSON.parse(localStorage.getItem('answers')) || {}
    setAnswer(saved[question.id] || '')
  }, [index])

  // ✅ timer logic
  useEffect(() => {
    if (moved.current) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          nextQuestion()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [index])

  const nextQuestion = () => {
    if (moved.current) return
    moved.current = true

    const stored = JSON.parse(localStorage.getItem('answers')) || {}
    stored[question.id] = answer
    localStorage.setItem('answers', JSON.stringify(stored))

    if (index < questions.length - 1) {
      router.push(`/assessment/${index + 1}`)
    } else {
      router.push('/assessment/result')
    }
  }

  if (!question) {
    return <p style={{ padding: 30 }}>Invalid question</p>
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>
        Question {index + 1} of {questions.length}
      </h2>

      <p><strong>Time left:</strong> {timeLeft}s</p>

      <p>{question.question}</p>

      <input
        type="text"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        style={{ width: '100%', padding: 8, marginTop: 10 }}
      />

      <button
        onClick={nextQuestion}
        style={{ marginTop: 20, padding: '10px 20px' }}
      >
        Next
      </button>
    </div>
  )
}

