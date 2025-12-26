import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all household members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const householdId = searchParams.get('householdId')
    const search = searchParams.get('search')
    const status = searchParams.get('status') // living, moved_out, all
    const residenceType = searchParams.get('residenceType') // permanent, temporary, all

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

    // Filter by status (living/moved_out)
    if (status && status !== 'all') {
      where.status = status
    }

    // Filter by residence type (permanent/temporary)
    if (residenceType && residenceType !== 'all') {
      where.residenceType = residenceType
    }

    const members = await prisma.householdMember.findMany({
      where,
      select: {
        id: true,
        name: true,
        dateOfBirth: true,
        cccd: true,
        profilePic: true,
        householdId: true,
        residenceType: true,
        relationToOwner: true,
        status: true,
        moveInDate: true,
        moveOutDate: true,
        note: true,
        household: householdId ? false : {
          select: {
            id: true,
            unit: true,
            ownerId: true,
            phone: true
          }
        },
        ownedHousehold: {
          select: {
            id: true,
            unit: true
          }
        },
        temporaryAbsences: {
          where: { status: 'active' },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            reason: true,
            destination: true,
            status: true
          },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    })

    // Add computed fields to each member
    const membersWithStatus = members.map(member => ({
      ...member,
      isOwner: member.ownedHousehold !== null,
      isTemporarilyAway: member.temporaryAbsences && member.temporaryAbsences.length > 0,
      activeTemporaryAbsence: member.temporaryAbsences?.[0] || null
    }))

    return NextResponse.json(membersWithStatus)
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

    // If adding to a household, check if household has an owner when relation is 'self'
    if (data.householdId && data.relationToOwner === 'self') {
      const household = await prisma.household.findUnique({
        where: { id: data.householdId },
        select: { ownerId: true, owner: { select: { name: true } } }
      })
      
      if (household?.ownerId) {
        return NextResponse.json(
          { error: `This household already has an owner: ${household.owner?.name}. Please select a different relation.` },
          { status: 400 }
        )
      }
    }

    const member = await prisma.householdMember.create({
      data: {
        name: data.name,
        dateOfBirth: new Date(data.dateOfBirth),
        cccd: data.cccd,
        profilePic: data.profilePic || null,
        householdId: data.householdId || null,
        residenceType: data.residenceType || 'permanent',
        relationToOwner: data.relationToOwner || null,
        status: 'living',
        moveInDate: data.moveInDate ? new Date(data.moveInDate) : new Date(),
        note: data.note || null
      },
      include: {
        household: {
          select: {
            id: true,
            unit: true,
            ownerId: true
          }
        },
        ownedHousehold: {
          select: {
            id: true,
            unit: true
          }
        }
      }
    })

    return NextResponse.json({
      ...member,
      isOwner: member.ownedHousehold !== null
    }, { status: 201 })
  } catch (error) {
    console.error('Create member error:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
