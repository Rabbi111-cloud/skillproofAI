'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { questions } from '../../../../questions'

export default function StepPage() {
  const router = useRouter()
  const params = useParams()
  const stepIndex = parseInt(params.step) || 0 // current question index

  const question = questions[stepIndex]
  const [answer, setAnswer] = useState('')
  const TOTAL_TIME = 30 // total seconds per question
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)

  // Load saved answer if user navigated back
  useEffect(() => {
    const savedAnswers = JSON.parse(localStorage.getItem('answers')) || {}
    if (savedAnswers[question.id]) {
      setAnswer(savedAnswers[question.id])
    }
  }, [question.id])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    if (timeLeft <= 0) {
      handleNext()
    }

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleNext = () => {
    // Save current answer
    const storedAnswers = JSON.parse(localStorage.getItem('answers')) || {}
    storedAnswers[question.id] = answer
    localStorage.setItem('answers', JSON.stringify(storedAnswers))

    // Move to next question or result page
    if (stepIndex + 1 < questions.length) {
      router.push(`/assessment/${stepIndex + 1}`)
    } else {
      router.push('/assessment/result')
    }
  }

  // Calculate progress percentage for the bar
  const progressPercent = (timeLeft / TOTAL_TIME) * 100

  return (
    <div style={{ padding: 30 }}>
      <h2>Question {stepIndex + 1} of {questions.length}</h2>
      
      {/* Timer display */}
      <p><strong>Time left:</strong> {timeLeft}s</p>
      
      {/* Progress bar */}
      <div style={{ 
        width: '100%', 
        height: 10, 
        backgroundColor: '#eee', 
        borderRadius: 5, 
        marginBottom: 20,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          backgroundColor: '#4caf50',
          transition: 'width 1s linear'
        }} />
      </div>

      <p>{question.question}</p>

      <input
        type="text"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        style={{ width: '100%', padding: 8, marginTop: 10 }}
      />

      <button
        onClick={handleNext}
        style={{ marginTop: 20, padding: '10px 20px' }}
      >
        Next
      </button>
    </div>
  )
}
