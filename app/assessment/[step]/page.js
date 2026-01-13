'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { questions } from '../questions'

const TOTAL_TIME = 30

export default function StepPage({ params }) {
  const router = useRouter()
  const step = params.step

  const [index, setIndex] = useState(Math.max(Number(step) - 1, 0))
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const moved = useRef(false)

  const question = questions[index]

  // Keep index synced with URL
  useEffect(() => {
    setIndex(Math.max(Number(step) - 1, 0))
  }, [step])

  // Reset state per question
  useEffect(() => {
    if (!question) return

    moved.current = false
    setTimeLeft(TOTAL_TIME)

    const saved = JSON.parse(localStorage.getItem('answers')) || {}
    setAnswer(saved[question.id] || '')
  }, [index, question])

  // Timer logic
  useEffect(() => {
    if (moved.current) return
    if (!question) return

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
  }, [index, question])

  // Next question navigation
  const nextQuestion = () => {
    if (moved.current) return
    moved.current = true

    const stored = JSON.parse(localStorage.getItem('answers')) || {}
    stored[question.id] = answer
    localStorage.setItem('answers', JSON.stringify(stored))

    if (index < questions.length - 1) {
      router.push(`/assessment/${index + 2}`) // next step (1-based)
    } else {
      router.push('/assessment/result')
    }
  }

  if (!question) {
    return (
      <div style={{ padding: 30 }}>
        <p>Invalid question or assessment complete.</p>
        <button onClick={() => router.push('/dashboard')}>Go back</button>
      </div>
    )
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
