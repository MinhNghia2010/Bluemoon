import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all households
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { unit: { contains: search, mode: 'insensitive' } },
        { owner: { name: { contains: search, mode: 'insensitive' } } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const households = await prisma.household.findMany({
      where,
      select: {
        id: true,
        unit: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            name: true,
            cccd: true,
            profilePic: true
          }
        },
        area: true,
        floor: true,
        moveInDate: true,
        phone: true,
        email: true,
        status: true,
        balance: true,
        members: {
          where: { status: 'living' },
          select: { id: true, name: true, profilePic: true }
        }
      },
      orderBy: { unit: 'asc' }
    })

    // Transform to include ownerName for backward compatibility
    const householdsWithBalance = households.map(household => ({
      ...household,
      ownerName: household.owner?.name || 'No owner',
      residents: household.members.length
    }))

    return NextResponse.json(householdsWithBalance, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59'
      }
    })
  } catch (error) {
    console.error('Get households error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new household
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { unit, ownerId, area, floor, moveInDate, phone, email } = data

    if (!unit || !phone || !email) {
      return NextResponse.json(
        { error: 'Unit, phone, and email are required' },
        { status: 400 }
      )
    }

    // Check if unit already exists
    const existing = await prisma.household.findUnique({
      where: { unit }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Unit already exists' },
        { status: 400 }
      )
    }

    const household = await prisma.household.create({
      data: {
        unit,
        ownerId: ownerId || null,
        area: area ? parseFloat(area) : null,
        floor: floor ? parseInt(floor) : null,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        phone,
        email,
        status: 'active'
      },
      include: {
        members: true,
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ 
      ...household, 
      ownerName: household.owner?.name || 'No owner',
      residents: household.members.length 
    }, { status: 201 })
  } catch (error) {
    console.error('Create household error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

