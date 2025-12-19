import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET single household member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.householdMember.findUnique({
      where: { id: params.id },
      include: {
        household: {
          select: {
            id: true,
            unit: true,
            ownerName: true
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Get member error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

// PUT update household member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Check if member exists
    const existingMember = await prisma.householdMember.findUnique({
      where: { id: params.id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if CCCD is being changed and if it already exists
    if (data.cccd && data.cccd !== existingMember.cccd) {
      const cccdExists = await prisma.householdMember.findUnique({
        where: { cccd: data.cccd }
      })
      if (cccdExists) {
        return NextResponse.json(
          { error: 'A member with this CCCD already exists' },
          { status: 400 }
        )
      }
    }

    const member = await prisma.householdMember.update({
      where: { id: params.id },
      data: {
        name: data.name,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        cccd: data.cccd,
        profilePic: data.profilePic !== undefined ? (data.profilePic || null) : undefined,
        householdId: data.householdId !== undefined ? (data.householdId || null) : undefined
      },
      include: {
        household: {
          select: {
            id: true,
            unit: true,
            ownerName: true
          }
        }
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Update member error:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE household member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.householdMember.findUnique({
      where: { id: params.id }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    await prisma.householdMember.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Member deleted successfully' })
  } catch (error) {
    console.error('Delete member error:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
