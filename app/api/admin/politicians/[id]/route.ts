import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { generateSlug } from '@/lib/constants'
import { serializePolicyField } from '@/lib/types'

const prisma = new PrismaClient()

// Generate a unique slug, adding state suffix if needed (excludes current politician)
async function generateUniqueSlug(name: string, state: string, excludeId: string): Promise<string> {
  const baseSlug = generateSlug(name)

  // Check if slug exists (excluding current politician)
  const existing = await prisma.politician.findFirst({
    where: { slug: baseSlug, NOT: { id: excludeId } }
  })

  if (!existing) {
    return baseSlug
  }

  // Add state suffix
  const slugWithState = `${baseSlug}-${state.toLowerCase()}`
  const existingWithState = await prisma.politician.findFirst({
    where: { slug: slugWithState, NOT: { id: excludeId } }
  })

  if (!existingWithState) {
    return slugWithState
  }

  // Add number suffix if still exists
  let counter = 2
  let finalSlug = `${slugWithState}-${counter}`
  while (await prisma.politician.findFirst({ where: { slug: finalSlug, NOT: { id: excludeId } } })) {
    counter++
    finalSlug = `${slugWithState}-${counter}`
  }

  return finalSlug
}

// GET /api/admin/politicians/[id] - Get single politician
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const politician = await prisma.politician.findUnique({
      where: { id },
    })

    if (!politician) {
      return NextResponse.json(
        { error: 'Politician not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(politician)
  } catch (error) {
    console.error('Error fetching politician:', error)
    return NextResponse.json(
      { error: 'Failed to fetch politician' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/politicians/[id] - Update politician
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const {
      name, state, district, office, status, grade,
      photoUrl, party, currentPosition, runningFor, runningForDistrict, published,
      economicPolicy, businessLabor, healthCare, education, environment,
      civilRights, votingRights, immigrationForeignAffairs, publicSafety
    } = body

    // Check if this is a full update or policy-only update
    const isPolicyOnlyUpdate = !name && !state && !office && !status && !grade

    // For full updates, require all fields
    if (!isPolicyOnlyUpdate && (!name || !state || !office || !status || !grade)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build update data based on what was provided
    const updateData: Record<string, any> = {}

    // Only include core fields if doing a full update
    if (!isPolicyOnlyUpdate) {
      // Check if name changed and regenerate slug if needed
      const current = await prisma.politician.findUnique({
        where: { id },
        select: { name: true }
      })

      if (current && current.name !== name) {
        updateData.slug = await generateUniqueSlug(name, state, id)
      }

      updateData.name = name
      updateData.state = state
      updateData.district = district || null
      updateData.office = office
      updateData.status = status
      updateData.grade = grade
      updateData.photoUrl = photoUrl || null
      updateData.party = party || null
      updateData.currentPosition = currentPosition || null
      updateData.runningFor = runningFor || null
      updateData.runningForDistrict = runningForDistrict || null
      updateData.published = published ?? false
    }

    // Always include policy fields if provided
    if (economicPolicy !== undefined) updateData.economicPolicy = serializePolicyField(economicPolicy)
    if (businessLabor !== undefined) updateData.businessLabor = serializePolicyField(businessLabor)
    if (healthCare !== undefined) updateData.healthCare = serializePolicyField(healthCare)
    if (education !== undefined) updateData.education = serializePolicyField(education)
    if (environment !== undefined) updateData.environment = serializePolicyField(environment)
    if (civilRights !== undefined) updateData.civilRights = serializePolicyField(civilRights)
    if (votingRights !== undefined) updateData.votingRights = serializePolicyField(votingRights)
    if (immigrationForeignAffairs !== undefined) updateData.immigrationForeignAffairs = serializePolicyField(immigrationForeignAffairs)
    if (publicSafety !== undefined) updateData.publicSafety = serializePolicyField(publicSafety)

    const politician = await prisma.politician.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(politician)
  } catch (error: any) {
    console.error('Error updating politician:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Politician not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update politician' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/politicians/[id] - Delete politician
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.politician.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting politician:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Politician not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete politician' },
      { status: 500 }
    )
  }
}
