import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT /api/admin/politicians/[id] - Update politician
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const politician = await prisma.politician.update({
      where: { id: params.id },
      data: {
        name,
        state,
        district: district || null,
        office,
        status,
        grade,
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.politician.delete({
      where: { id: params.id },
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
