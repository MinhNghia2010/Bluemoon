import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all household members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const householdId = searchParams.get('householdId')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (householdId) {
      where.householdId = householdId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cccd: { contains: search, mode: 'insensitive' } }
      ]
    }

    const members = await prisma.householdMember.findMany({
      where,
      include: {
        household: {
          select: {
            id: true,
            unit: true,
            ownerName: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST create new household member
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.dateOfBirth || !data.cccd) {
      return NextResponse.json(
        { error: 'Name, date of birth, and CCCD are required' },
        { status: 400 }
      )
    }

    // Check if CCCD already exists
    const existingMember = await prisma.householdMember.findUnique({
      where: { cccd: data.cccd }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'A member with this CCCD already exists' },
        { status: 400 }
      )
    }

    const member = await prisma.householdMember.create({
      data: {
        name: data.name,
        dateOfBirth: new Date(data.dateOfBirth),
        cccd: data.cccd,
        profilePic: data.profilePic || null,
        householdId: data.householdId || null
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

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Create member error:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
