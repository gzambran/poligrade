import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/politicians - List all politicians with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const state = searchParams.get('state')
    const office = searchParams.get('office')
    const status = searchParams.get('status')
    const grade = searchParams.get('grade')

    const where: any = {}

    if (name) {
      where.name = { contains: name, mode: 'insensitive' }
    }
    if (state) {
      where.state = state
    }
    if (office) {
      where.office = office
    }
    if (status) {
      where.status = status
    }
    if (grade) {
      where.grade = grade
    }

    const politicians = await prisma.politician.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(politicians)
  } catch (error) {
    console.error('Error fetching politicians:', error)
    return NextResponse.json(
      { error: 'Failed to fetch politicians' },
      { status: 500 }
    )
  }
}

// POST /api/admin/politicians - Create new politician
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, state, district, office, status, grade } = body

    // Validation
    if (!name || !state || !office || !status || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const politician = await prisma.politician.create({
      data: {
        name,
        state,
        district: district || null,
        office,
        status,
        grade,
      },
    })

    return NextResponse.json(politician, { status: 201 })
  } catch (error) {
    console.error('Error creating politician:', error)
    return NextResponse.json(
      { error: 'Failed to create politician' },
      { status: 500 }
    )
  }
}
