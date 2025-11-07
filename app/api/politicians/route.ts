import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Public endpoint - no authentication required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')

    const where: any = {}

    if (grade) {
      where.grade = grade
    }

    const politicians = await prisma.politician.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        state: true,
        district: true,
        office: true,
        status: true,
        grade: true,
      },
    })

    // Transform to match the old JSON format for compatibility
    const transformed = politicians.map(p => ({
      name: p.name,
      district: p.district ? `${p.state} - ${p.district}` : p.state,
      office: formatOffice(p.office),
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
