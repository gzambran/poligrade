import { Suspense } from 'react'
import { PrismaClient } from '@prisma/client'
import type { Metadata } from 'next'
import GradesClient from './GradesClient'

export const metadata: Metadata = {
  title: 'Politician Grades - PoliGrade',
  description: 'Browse and search policy-based grades for over 500 elected officials including governors, senators, and representatives. Filter by state, office, and political alignment.',
}

// Revalidate cached data every 60 seconds so published changes appear within a minute
export const revalidate = 60

interface Politician {
  id: string
  name: string
  slug: string | null
  state: string
  district: string
  office: string
  status: string
  grade: string
  published: boolean
  runningFor: string | null
  runningForDistrict: string | null
}

// Singleton pattern for Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

function formatOffice(office: string): string {
  switch (office) {
    case 'GOVERNOR':
      return 'Governor'
    case 'SENATOR':
      return 'Senator'
    case 'HOUSE_REPRESENTATIVE':
      return 'House Representative'
    default:
      return office
  }
}

function formatGrade(grade: string): string {
  return grade.charAt(0) + grade.slice(1).toLowerCase()
}

function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

async function getPoliticians(): Promise<Politician[]> {
  // Use raw query to avoid prepared statement cache issues
  const politicians: any[] = await prisma.$queryRaw`
    SELECT id, name, slug, state, district, office, status, grade, published, "runningFor", "runningForDistrict"
    FROM "Politician"
    ORDER BY name ASC
  `

  return politicians.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    state: p.state,
    district: p.district || '',
    office: p.office,
    status: formatStatus(p.status),
    grade: formatGrade(p.grade),
    published: p.published,
    runningFor: p.runningFor,
    runningForDistrict: p.runningForDistrict,
  }))
}

export default async function GradesPage() {
  const politicians = await getPoliticians()

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="text-2xl">Loading politicians...</div>
        </div>
      </div>
    }>
      <GradesClient politicians={politicians} />
    </Suspense>
  )
}
