function calculateScore(answers) {
  let score = 0

  questions.forEach(q => {
    const userAnswer = answers[q.id]?.toLowerCase() || ''
    const correct = q.answer.toLowerCase()

    if (userAnswer.includes(correct.split(' ')[0])) {
      score += 5
    }

    if (userAnswer.includes(correct)) {
      score += 5
    }
  })

  return score
}
