import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET global search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    // Search in parallel across multiple tables
    const [households, members, parking] = await Promise.all([
      // Search households
      prisma.household.findMany({
        where: {
          OR: [
            { unit: { contains: query, mode: 'insensitive' } },
            { ownerName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: { id: true, unit: true, ownerName: true }
      }),
      
      // Search members
      prisma.householdMember.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { cccd: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        include: {
          household: { select: { unit: true } }
        }
      }),
      
      // Search parking slots
      prisma.parkingSlot.findMany({
        where: {
          OR: [
            { slotNumber: { contains: query, mode: 'insensitive' } },
            { licensePlate: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: { id: true, slotNumber: true, licensePlate: true, type: true, household: { select: { unit: true, ownerName: true } } }
      })
    ])

    // Format results
    const results = [
      ...households.map(h => ({
        type: 'household' as const,
        id: h.id,
        title: `Unit ${h.unit}`,
        subtitle: h.ownerName,
        view: 'households' as const
      })),
      ...members.map(m => ({
        type: 'member' as const,
        id: m.id,
        title: m.name,
        subtitle: `Unit ${m.household.unit} • CCCD: ${m.cccd}`,
        view: 'demography' as const
      })),
      ...parking.map(p => ({
        type: 'parking' as const,
        id: p.id,
        title: `Slot ${p.slotNumber}`,
        subtitle: `${p.household?.ownerName || 'No owner'} • ${p.licensePlate || 'No plate'}`,
        view: 'parking' as const
      }))
    ]

    return NextResponse.json({ results: results.slice(0, 10) })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    )
  }
}
