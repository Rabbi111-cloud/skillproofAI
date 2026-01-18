'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { questions } from '../questions'

const TOTAL_TIME = 60

export default function StepPage({ params }) {
  const router = useRouter()
  const step = params.step

  const [index, setIndex] = useState(Math.max(Number(step) - 1, 0))
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)

  const moved = useRef(false)
  const lastActiveTime = useRef(Date.now())
  const intervalRef = useRef(null)

  const question = questions[index]

  // Keep index synced with URL
  useEffect(() => {
    setIndex(Math.max(Number(step) - 1, 0))
  }, [step])

  // Restore state per question (ANTI-REFRESH)
  useEffect(() => {
    if (!question) return

    moved.current = false

    const savedAnswers = JSON.parse(localStorage.getItem('answers')) || {}
    setAnswer(savedAnswers[question.id] || '')

    const savedTime = localStorage.getItem(`time-${question.id}`)
    setTimeLeft(savedTime ? Number(savedTime) : TOTAL_TIME)

    lastActiveTime.current = Date.now()
  }, [index, question])

  // Timer logic (PAUSE-SAFE)
  useEffect(() => {
    if (!question || moved.current) return

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          nextQuestion()
          return 0
        }

        const next = prev - 1
        localStorage.setItem(`time-${question.id}`, next)
        return next
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [index, question])

  // Tab visibility handling (PAUSE TIMER)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current)
      } else {
        const now = Date.now()
        const elapsed = Math.floor((now - lastActiveTime.current) / 1000)

        setTimeLeft(prev => {
          const updated = Math.max(prev - elapsed, 0)
          localStorage.setItem(`time-${question.id}`, updated)
          return updated
        })

        lastActiveTime.current = now
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [question])

  // Next question navigation (UNCHANGED LOGIC)
  const nextQuestion = () => {
    if (moved.current) return
    moved.current = true

    const stored = JSON.parse(localStorage.getItem('answers')) || {}
    stored[question.id] = answer
    localStorage.setItem('answers', JSON.stringify(stored))

    localStorage.removeItem(`time-${question.id}`)

    if (index < questions.length - 1) {
      router.push(`/assessment/${index + 2}`)
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

  // Timer bar UI
  const progressPercent = (timeLeft / TOTAL_TIME) * 100

  let barColor = '#22c55e'
  if (timeLeft <= 20) barColor = '#ef4444'
  else if (timeLeft <= 40) barColor = '#f59e0b'

  return (
    <div style={{ padding: 30 }}>
      <h2>
        Question {index + 1} of {questions.length}
      </h2>

      {/* Timer Bar */}
      <div
        style={{
          height: 10,
          width: '100%',
          background: '#e5e7eb',
          borderRadius: 6,
          overflow: 'hidden',
          marginBottom: 20
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: barColor,
            transition: 'width 1s linear, background 0.3s ease'
          }}
        />
      </div>

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
