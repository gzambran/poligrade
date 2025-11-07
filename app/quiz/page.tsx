'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardBody, Progress } from '@nextui-org/react'
import Link from 'next/link'

interface QuizQuestion {
  id: number
  issueArea: string
  question: string
  point: number
}

export default function QuizPage() {
  const [quizData, setQuizData] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch('/questionnaire.json')
        if (!response.ok) throw new Error('Failed to fetch quiz data')
        const data = await response.json()
        setQuizData(data)
      } catch (error) {
        console.error('Error loading quiz data:', error)
      }
    }
    fetchQuizData()
  }, [])

  const handleOptionClick = (option: 'Yes' | 'No') => {
    const current = quizData[currentQuestion]
    if (option === 'Yes') {
      setTotalScore((prev) => prev - current.point)
    } else {
      setTotalScore((prev) => prev + current.point)
    }
    setCurrentQuestion((prev) => prev + 1)
  }

  const getResultLabel = (score: number) => {
    if (score >= 16) return 'Progressive'
    if (score >= 4) return 'Liberal'
    if (score >= -2) return 'Centrist'
    if (score >= -8) return 'Moderate'
    if (score >= -17) return 'Conservative'
    return 'Nationalist'
  }

  const getResultDescription = (party: string) => {
    const descriptions: Record<string, string> = {
      Progressive: 'Universal Social Programs, Green New Deal',
      Liberal: 'Public Option Expansion, Democracy Protections',
      Centrist: 'Market-Focused Social Programs, Bipartisan Solutions',
      Moderate: 'Limited Government Role, Minimal Social Spending',
      Conservative: 'Upper Bracket Tax Cuts, National Defense Emphasis',
      Nationalist: 'Isolationist Economics, Cultural Traditionalism',
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

            <Card className="mb-8">
              <CardBody className="p-8">
                <div className="flex justify-center gap-12 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{quizData.length}</div>
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
                  onPress={() => setQuizStarted(true)}
                >
                  Start Quiz
                </Button>
              </CardBody>
            </Card>

            <p className="text-sm text-foreground/60">
              Questions cover Economic Policy, Health Care, Education, Environment, Civil Rights, and more.
            </p>
        </div>
      </div>
    )
  }

  // Results screen
  if (currentQuestion >= quizData.length) {
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

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                color="primary"
                onPress={() => {
                  setCurrentQuestion(0)
                  setTotalScore(0)
                  setQuizStarted(false)
                }}
              >
                Retake Quiz
              </Button>
              <Button
                as={Link}
                href={`/grades?grade=${encodeURIComponent(resultLabel)}`}
                size="lg"
                variant="bordered"
              >
                View {resultLabel} Politicians
              </Button>
            </div>
          </div>
        </div>
    )
  }

  // Quiz question screen
  const current = quizData[currentQuestion]
  const progressPercent = Math.round((currentQuestion / quizData.length) * 100)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground/60">
              Question {currentQuestion + 1} of {quizData.length}
            </span>
            <span className="text-sm font-semibold">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} color="primary" className="h-2" />
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                color="success"
                className="font-semibold text-lg min-w-[140px]"
                onPress={() => handleOptionClick('Yes')}
              >
                Yes
              </Button>
              <Button
                size="lg"
                variant="flat"
                className="font-semibold text-lg min-w-[140px]"
                onPress={() => handleOptionClick('No')}
              >
                No
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
