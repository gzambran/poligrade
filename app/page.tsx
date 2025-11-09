'use client'

import Link from 'next/link'
import { Button, Card, CardBody } from '@nextui-org/react'

const policyParties = [
  {
    name: 'Progressive',
    policies: ['Expansive Social Reform', 'Strong Government Control'],
  },
  {
    name: 'Liberal',
    policies: ['Regulated Markets', 'Broad Civil Rights'],
  },
  {
    name: 'Centrist',
    policies: ['Bipartisan Approach', 'Gradual Change'],
  },
  {
    name: 'Moderate',
    policies: ['Fiscal Restraint', 'Limited Government'],
  },
  {
    name: 'Conservative',
    policies: ['Upper Bracket Tax Cuts', 'Traditional Values'],
  },
  {
    name: 'Nationalist',
    policies: ['Isolationist Focus', 'Cultural Preservation'],
  },
]

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 transform">
            <div className="h-[800px] w-[800px] rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10 blur-3xl" />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-divider bg-content1 px-4 py-1.5 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-foreground/60">Now in Beta</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Democracy Powered by{' '}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Data, Not Drama
              </span>
            </h1>

            {/* Subcopy */}
            <p className="mb-10 max-w-2xl text-lg text-foreground/60 sm:text-xl">
              We cut through rhetoric and misinformation by grading leaders on real policy beliefs.
              Our goal is to give voters clear, fact-based insight that restores accountability and helps you
              make better choices at the ballot box.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                as={Link}
                href="/quiz"
                size="lg"
                color="primary"
                className="font-semibold"
              >
                Take Alignment Quiz
              </Button>
              <Button
                as={Link}
                href="/grades"
                size="lg"
                variant="bordered"
                className="font-semibold"
              >
                Check Politician Grades
              </Button>
            </div>

            {/* Stats or trust indicators */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-foreground">6</div>
                <div className="text-sm text-foreground/60">Policy Parties</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-foreground">500+</div>
                <div className="text-sm text-foreground/60">Politicians Graded</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-foreground">Real-time</div>
                <div className="text-sm text-foreground/60">Updates</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-foreground">Fact-based</div>
                <div className="text-sm text-foreground/60">Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six Policy Parties Section */}
      <section className="border-t border-divider py-20 bg-gradient-to-b from-transparent to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Six Policy-Based Parties
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-foreground/60">
              Our data-driven framework categorizes political positions into six distinct ideological clusters.
            </p>
          </div>

          <div className="mx-auto max-w-6xl grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {policyParties.map((party, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-divider/50 bg-content1 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <h3 className="mb-6 text-2xl font-bold">{party.name}</h3>
                  <ul className="space-y-4">
                    {party.policies.map((policy, pIndex) => (
                      <li key={pIndex} className="flex items-start gap-3 text-base leading-relaxed">
                        <svg
                          className="mt-1 h-5 w-5 flex-shrink-0 text-primary"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{policy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-12 max-w-3xl text-center text-sm text-foreground/50 italic">
            The beliefs shown are examples of general tendencies, not requirements for any grade.
          </p>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="border-t border-divider py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-divider bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-600/5 dark:via-purple-600/5 dark:to-pink-600/5 p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to make informed decisions?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground/60">
              Join voters who are cutting through the noise and focusing on what matters: policy and accountability.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                as={Link}
                href="/quiz"
                size="lg"
                color="primary"
                className="font-semibold"
              >
                Find Your Alignment
              </Button>
              <Button
                as={Link}
                href="/contact"
                size="lg"
                variant="flat"
                className="font-semibold"
              >
                Get Involved
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
