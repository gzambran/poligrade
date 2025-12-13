import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import type { Metadata } from 'next'
import PoliticianProfile from './PoliticianProfile'
import { formatGrade, formatOffice, formatParty, formatRunningFor, STATE_MAP } from '@/lib/constants'

// Singleton pattern for Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPolitician(slug: string) {
  const politician = await prisma.politician.findUnique({
    where: { slug }
  })

  if (!politician || !politician.published) {
    return null
  }

  return politician
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const politician = await getPolitician(slug)

  if (!politician) {
    return {
      title: 'Politician Not Found - PoliGrade',
    }
  }

  const gradeLabel = formatGrade(politician.grade)
  const officeLabel = formatOffice(politician.office)
  const stateLabel = STATE_MAP[politician.state] || politician.state

  return {
    title: `${politician.name} - ${gradeLabel} ${officeLabel} - PoliGrade`,
    description: `View the policy-based grade and political stances of ${politician.name}, ${officeLabel} from ${stateLabel}. Classified as ${gradeLabel} based on their positions across 9 policy areas.`,
  }
}

export default async function PoliticianPage({ params }: PageProps) {
  const { slug } = await params
  const politician = await getPolitician(slug)

  if (!politician) {
    notFound()
  }

  // Transform data for client component
  const profileData = {
    id: politician.id,
    name: politician.name,
    slug: politician.slug!,
    state: politician.state,
    stateLabel: STATE_MAP[politician.state] || politician.state,
    district: politician.district,
    office: politician.office,
    officeLabel: formatOffice(politician.office),
    status: politician.status,
    grade: politician.grade,
    gradeLabel: formatGrade(politician.grade),
    photoUrl: politician.photoUrl,
    party: politician.party,
    partyLabel: formatParty(politician.party),
    currentPosition: politician.currentPosition,
    runningFor: politician.runningFor,
    runningForLabel: formatRunningFor(politician.runningFor),
    // Issue fields
    economicPolicy: politician.economicPolicy,
    businessLabor: politician.businessLabor,
    healthCare: politician.healthCare,
    education: politician.education,
    environment: politician.environment,
    civilRights: politician.civilRights,
    votingRights: politician.votingRights,
    immigrationForeignAffairs: politician.immigrationForeignAffairs,
    publicSafety: politician.publicSafety,
  }

  return <PoliticianProfile politician={profileData} />
}
