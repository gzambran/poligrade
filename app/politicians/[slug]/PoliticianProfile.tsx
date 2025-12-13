'use client'

import Link from 'next/link'
import { Card, CardBody, Chip } from '@nextui-org/react'
import { getGradeColor, ISSUE_CRITERIA } from '@/lib/constants'
import { parsePolicyField } from '@/lib/types'

interface PoliticianProfileProps {
  politician: {
    id: string
    name: string
    slug: string
    state: string
    stateLabel: string
    district: string | null
    office: string
    officeLabel: string
    status: string
    grade: string
    gradeLabel: string
    photoUrl: string | null
    party: string | null
    partyLabel: string | null
    currentPosition: string | null
    runningFor: string | null
    runningForLabel: string | null
    economicPolicy: string | null
    businessLabor: string | null
    healthCare: string | null
    education: string | null
    environment: string | null
    civilRights: string | null
    votingRights: string | null
    immigrationForeignAffairs: string | null
    publicSafety: string | null
  }
}

const PARTY_COLORS: Record<string, string> = {
  Democrat: '#3b82f6',
  Republican: '#ef4444',
  Independent: '#8b5cf6',
}

export default function PoliticianProfile({ politician }: PoliticianProfileProps) {
  const gradeColor = getGradeColor(politician.gradeLabel)

  // Build issue list from politician data, parsing JSON arrays
  const issues = ISSUE_CRITERIA
    .map(({ key, label }) => ({
      key,
      label,
      stances: parsePolicyField(politician[key as keyof typeof politician] as string | null),
    }))
    .filter(issue => issue.stances.length > 0)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-foreground/60">
          <li>
            <Link href="/grades" className="hover:text-primary transition-colors">
              Grades
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium">{politician.name}</li>
        </ol>
      </nav>

      {/* Profile Header */}
      <Card className="mb-8">
        <CardBody className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* Photo */}
            {politician.photoUrl && (
              <div className="flex-shrink-0">
                <img
                  src={politician.photoUrl}
                  alt={`Photo of ${politician.name}`}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover shadow-lg mx-auto sm:mx-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">{politician.name}</h1>

              {/* Grade Badge */}
              <div className="mb-4">
                <span
                  className="inline-block px-4 py-2 rounded-full text-lg font-bold"
                  style={{
                    backgroundColor: `${gradeColor.bg}20`,
                    color: gradeColor.text,
                  }}
                >
                  {politician.gradeLabel}
                </span>
              </div>

              {/* Party and Position */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                {politician.partyLabel && (
                  <Chip
                    size="sm"
                    variant="flat"
                    style={{
                      backgroundColor: `${PARTY_COLORS[politician.partyLabel] || '#6b7280'}20`,
                      color: PARTY_COLORS[politician.partyLabel] || '#6b7280',
                    }}
                  >
                    {politician.partyLabel}
                  </Chip>
                )}
                <Chip size="sm" variant="flat" color="default">
                  {politician.officeLabel}
                </Chip>
                <Chip size="sm" variant="flat" color="default">
                  {politician.stateLabel}
                  {politician.district && ` - District ${politician.district}`}
                </Chip>
              </div>

              {/* Additional Details */}
              <div className="space-y-2 text-foreground/80">
                {politician.currentPosition && (
                  <p>
                    <span className="font-medium">Current Position:</span> {politician.currentPosition}
                  </p>
                )}
                {politician.runningForLabel && (
                  <p>
                    <span className="font-medium">Running For:</span> {politician.runningForLabel}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Issue Stances */}
      {issues.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Policy Positions</h2>
          <div className="grid gap-4">
            {issues.map((issue) => (
              <Card key={issue.key} className="shadow-sm">
                <CardBody className="p-5">
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    {issue.label}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80">
                    {issue.stances.map((stance, index) => (
                      <li key={index} className="leading-relaxed">
                        {stance}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty State for No Issues */}
      {issues.length === 0 && (
        <Card className="shadow-sm">
          <CardBody className="p-8 text-center">
            <p className="text-foreground/60">
              Policy positions for this politician are still being researched by our volunteers.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Back Link */}
      <div className="mt-12 text-center">
        <Link
          href="/grades"
          className="text-primary hover:underline font-medium"
        >
          Back to Politician Grades
        </Link>
      </div>
    </div>
  )
}
