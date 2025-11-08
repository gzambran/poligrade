import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Use singleton pattern to avoid connection issues
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Public endpoint - no authentication required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')

    // Use raw query to bypass prepared statement cache issues
    let politicians: any[]

    if (grade) {
      const gradeUpper = grade.toUpperCase()
      politicians = await prisma.$queryRaw`
        SELECT id, name, state, district, office, status, grade
        FROM "Politician"
        WHERE grade = ${gradeUpper}::text::"Grade"
        ORDER BY name ASC
      `
    } else {
      politicians = await prisma.$queryRaw`
        SELECT id, name, state, district, office, status, grade
        FROM "Politician"
        ORDER BY name ASC
      `
    }

    // Return separate state and district fields
    const transformed = politicians.map(p => ({
      id: p.id,
      name: p.name,
      state: p.state,
      district: p.district || '',
      office: formatOffice(p.office),
      status: formatStatus(p.status),
      grade: formatGrade(p.grade),
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching politicians:', error)
    return NextResponse.json(
      { error: 'Failed to fetch politicians' },
      { status: 500 }
    )
  }
}

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
