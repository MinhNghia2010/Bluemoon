import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET temporary absence records for a member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const records = await (prisma as any).temporaryAbsence.findMany({
      where: { memberId: id },
      orderBy: { startDate: 'desc' }
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Get temporary absence error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch temporary absence records' },
      { status: 500 }
    )
  }
}

// POST create new temporary absence record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Validate required fields
    if (!data.startDate) {
      return NextResponse.json(
        { error: 'Start date is required' },
        { status: 400 }
      )
    }

    // Check if member exists
    const member = await prisma.householdMember.findUnique({
      where: { id }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // End any existing active temporary absence
    await (prisma as any).temporaryAbsence.updateMany({
      where: { 
        memberId: id, 
        status: 'active' 
      },
      data: { 
        status: 'returned',
        endDate: new Date()
      }
    })

    const record = await (prisma as any).temporaryAbsence.create({
      data: {
        memberId: id,
        registrationNumber: data.registrationNumber || null,
        destination: data.destination || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        reason: data.reason || null,
        status: 'active'
      }
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Create temporary absence error:', error)
    return NextResponse.json(
      { error: 'Failed to create temporary absence record' },
      { status: 500 }
    )
  }
}

// PUT update temporary absence record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    if (!data.recordId) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }

    const record = await (prisma as any).temporaryAbsence.update({
      where: { id: data.recordId },
      data: {
        registrationNumber: data.registrationNumber,
        destination: data.destination,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
        reason: data.reason,
        status: data.status
      }
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Update temporary absence error:', error)
    return NextResponse.json(
      { error: 'Failed to update temporary absence record' },
      { status: 500 }
    )
  }
}

// DELETE temporary absence record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('recordId')

    if (!recordId) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }

    await (prisma as any).temporaryAbsence.delete({
      where: { id: recordId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete temporary absence error:', error)
    return NextResponse.json(
      { error: 'Failed to delete temporary absence record' },
      { status: 500 }
    )
  }
}
