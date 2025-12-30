'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Progress } from '@nextui-org/react'
import Link from 'next/link'

interface QuizQuestion {
  id: number
  issueArea: string
  question: string
  point: number
}

interface QuizClientProps {
  questions: QuizQuestion[]
}

export default function QuizClient({ questions }: QuizClientProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [scoreHistory, setScoreHistory] = useState<number[]>([])

  const handleOptionClick = (option: 'Support' | 'Oppose') => {
    const current = questions[currentQuestion]
    // Save current score to history before updating
    setScoreHistory((prev) => [...prev, totalScore])

    if (option === 'Support') {
      setTotalScore((prev) => prev - current.point)
    } else {
      setTotalScore((prev) => prev + current.point)
    }
    setCurrentQuestion((prev) => prev + 1)
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      // Restore previous score from history
      const previousScore = scoreHistory[scoreHistory.length - 1]
      setTotalScore(previousScore)
      setScoreHistory((prev) => prev.slice(0, -1))
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const getResultLabel = (score: number) => {
    if (score >= 25) return 'Progressive'
    if (score >= 13) return 'Liberal'
    if (score >= 0) return 'Centrist'
    if (score >= -12) return 'Moderate'
    if (score >= -24) return 'Conservative'
    return 'Nationalist'
  }

  const getResultDescription = (party: string) => {
    const descriptions: Record<string, string> = {
      Progressive: 'Expansive Social Reform, Strong Government Control',
      Liberal: 'Regulated Markets, Broad Civil Rights',
      Centrist: 'Bipartisan Approach, Gradual Change',
      Moderate: 'Fiscal Restraint, Limited Government',
      Conservative: 'Upper Bracket Tax Cuts, Traditional Values',
      Nationalist: 'Isolationist Focus, Cultural Preservation',
    }
    return descriptions[party] || ''
  }

  // Start screen
  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Voter Alignment Quiz</h1>
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
              Discover which of our six policy-based parties aligns with your beliefs
              through questions on key policy issues.
            </p>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-foreground/80 mb-4">Topics Covered:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Economic Policy',
                  'Business & Labor',
                  'Health Care',
                  'Education',
                  'Environment',
                  'Civil Rights',
                  'Voting Rights & Democracy',
                  'Immigration & Foreign Affairs',
                  'Public Safety',
                ].map((topic) => (
                  <span
                    key={topic}
                    className="inline-block bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <Card className="mb-8">
              <CardBody className="p-8">
                <div className="flex justify-center gap-12 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{questions.length}</div>
                    <div className="text-sm text-foreground/60">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success mb-2">~10</div>
                    <div className="text-sm text-foreground/60">Minutes</div>
                  </div>
                </div>
                <Button
                  size="lg"
                  color="primary"
                  className="font-semibold"
                  onPress={() => {
                    setQuizStarted(true)
                    setScoreHistory([])
                  }}
                >
                  Start Quiz
                </Button>
              </CardBody>
            </Card>
        </div>
      </div>
    )
  }

  // Results screen
  if (currentQuestion >= questions.length) {
    const resultLabel = getResultLabel(totalScore)
    const description = getResultDescription(resultLabel)

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
              <p className="text-lg text-foreground/60">
                Here&apos;s your political alignment based on your answers
              </p>
            </div>

            <div role="status" aria-live="polite" aria-atomic="true">
              <Card className="mb-8">
                <CardBody className="p-10">
                  <div className="mb-6">
                    <div className="text-sm text-foreground/60 mb-2">Your Party Alignment</div>
                    <div className="text-5xl font-bold text-primary mb-4">{resultLabel}</div>
                    <p className="text-lg text-foreground/80">{description}</p>
                  </div>
                  <div className="pt-6 border-t border-divider">
                    <div className="text-sm text-foreground/60 mb-2">Your Score</div>
                    <div className="text-2xl font-bold">{totalScore}</div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                color="primary"
                onPress={() => {
                  setCurrentQuestion(0)
                  setTotalScore(0)
                  setQuizStarted(false)
                  setScoreHistory([])
                }}
                aria-label="Retake the alignment quiz"
              >
                Retake Quiz
              </Button>
              <Button
                as={Link}
                href={`/grades?grade=${encodeURIComponent(resultLabel)}`}
                size="lg"
                variant="bordered"
                aria-label={`View all ${resultLabel} politicians`}
              >
                View {resultLabel} Politicians
              </Button>
            </div>
          </div>
        </div>
    )
  }

  // Quiz question screen
  const current = questions[currentQuestion]
  const progressPercent = Math.round((currentQuestion / questions.length) * 100)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground/60">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold">{progressPercent}%</span>
          </div>
          <Progress
            value={progressPercent}
            color="primary"
            className="h-2"
            aria-label={`Quiz progress: ${progressPercent}% complete, question ${currentQuestion + 1} of ${questions.length}`}
          />
        </div>

        {/* Issue Area Badge */}
        {current.issueArea && (
          <div className="mb-6">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              {current.issueArea}
            </span>
          </div>
        )}

        {/* Question Card */}
        <Card className="mb-6">
          <CardBody className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-relaxed min-h-[120px] flex items-center">
              {current.question}
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center" role="group" aria-label={`Answer question: ${current.question}`}>
                <Button
                  size="lg"
                  color="primary"
                  className="font-semibold text-lg min-w-[140px]"
                  onPress={() => handleOptionClick('Support')}
                  aria-label={`Support: ${current.question}`}
                >
                  Support
                </Button>
                <Button
                  size="lg"
                  variant="bordered"
                  className="font-semibold text-lg min-w-[140px]"
                  onPress={() => handleOptionClick('Oppose')}
                  aria-label={`Oppose: ${current.question}`}
                >
                  Oppose
                </Button>
              </div>

              {currentQuestion > 0 && (
                <div className="flex justify-center">
                  <Button
                    size="md"
                    variant="light"
                    className="font-medium"
                    onPress={handleBack}
                    aria-label="Go back to previous question"
                  >
                    ← Back
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
