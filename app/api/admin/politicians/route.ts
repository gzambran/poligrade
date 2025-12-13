import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { generateSlug } from '@/lib/constants'
import { serializePolicyField } from '@/lib/types'

const prisma = new PrismaClient()

// Generate a unique slug, adding state suffix if needed
async function generateUniqueSlug(name: string, state: string): Promise<string> {
  const baseSlug = generateSlug(name)

  // Check if slug exists
  const existing = await prisma.politician.findUnique({
    where: { slug: baseSlug }
  })

  if (!existing) {
    return baseSlug
  }

  // Add state suffix
  const slugWithState = `${baseSlug}-${state.toLowerCase()}`
  const existingWithState = await prisma.politician.findUnique({
    where: { slug: slugWithState }
  })

  if (!existingWithState) {
    return slugWithState
  }

  // Add number suffix if still exists
  let counter = 2
  let finalSlug = `${slugWithState}-${counter}`
  while (await prisma.politician.findUnique({ where: { slug: finalSlug } })) {
    counter++
    finalSlug = `${slugWithState}-${counter}`
  }

  return finalSlug
}

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
    const published = searchParams.get('published')

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
    if (published) {
      where.published = published === 'true'
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
    const {
      name, state, district, office, status, grade,
      photoUrl, party, currentPosition, runningFor, published,
      economicPolicy, businessLabor, healthCare, education, environment,
      civilRights, votingRights, immigrationForeignAffairs, publicSafety
    } = body

    // Validation
    if (!name || !state || !office || !status || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(name, state)

    const politician = await prisma.politician.create({
      data: {
        name,
        slug,
        state,
        district: district || null,
        office,
        status,
        grade,
        // Profile fields
        photoUrl: photoUrl || null,
        party: party || null,
        currentPosition: currentPosition || null,
        runningFor: runningFor || null,
        published: published ?? false,
        // Issue fields (serialize arrays to JSON strings)
        economicPolicy: serializePolicyField(economicPolicy),
        businessLabor: serializePolicyField(businessLabor),
        healthCare: serializePolicyField(healthCare),
        education: serializePolicyField(education),
        environment: serializePolicyField(environment),
        civilRights: serializePolicyField(civilRights),
        votingRights: serializePolicyField(votingRights),
        immigrationForeignAffairs: serializePolicyField(immigrationForeignAffairs),
        publicSafety: serializePolicyField(publicSafety),
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
