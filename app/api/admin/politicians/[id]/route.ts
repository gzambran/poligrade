import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { generateSlug } from '@/lib/constants'

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

    // Check if name changed and regenerate slug if needed
    const current = await prisma.politician.findUnique({
      where: { id },
      select: { name: true }
    })

    let slug: string | undefined
    if (current && current.name !== name) {
      slug = await generateUniqueSlug(name, state, id)
    }

    const politician = await prisma.politician.update({
      where: { id },
      data: {
        name,
        ...(slug && { slug }),
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
        // Issue fields
        economicPolicy: economicPolicy || null,
        businessLabor: businessLabor || null,
        healthCare: healthCare || null,
        education: education || null,
        environment: environment || null,
        civilRights: civilRights || null,
        votingRights: votingRights || null,
        immigrationForeignAffairs: immigrationForeignAffairs || null,
        publicSafety: publicSafety || null,
      },
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
