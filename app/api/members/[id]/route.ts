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

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Add isOwner flag
    const isOwner = member.ownedHousehold !== null

    return NextResponse.json({
      ...member,
      isOwner
    })
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

    // Check if member exists with household and ownership info
    const existingMember = await prisma.householdMember.findUnique({
      where: { id: params.id },
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

    // Check if trying to set relation to 'self' when household already has an owner
    if (data.relationToOwner === 'self' && existingMember.householdId) {
      const household = await prisma.household.findUnique({
        where: { id: existingMember.householdId },
        select: { ownerId: true, owner: { select: { name: true } } }
      })
      
      // If there's an owner and it's not this member
      if (household?.ownerId && household.ownerId !== existingMember.id) {
        return NextResponse.json(
          { error: `This household already has an owner: ${household.owner?.name}. Please select a different relation.` },
          { status: 400 }
        )
      }
    }

    // Check if this is an owner being moved out
    const isOwner = existingMember.ownedHousehold !== null
    const isBeingMovedOut = data.status === 'moved_out' && existingMember.status !== 'moved_out'
    
    if (isOwner && isBeingMovedOut && existingMember.ownedHousehold) {
      // Check if newOwnerId is provided
      if (!data.newOwnerId) {
        return NextResponse.json(
          { 
            error: 'Owner moving out requires selecting a new owner',
            requiresNewOwner: true,
            householdId: existingMember.ownedHousehold.id,
            householdUnit: existingMember.ownedHousehold.unit
          },
          { status: 400 }
        )
      }
      
      // Validate the new owner exists and is in the same household
      const newOwner = await prisma.householdMember.findUnique({
        where: { id: data.newOwnerId }
      })
      
      if (!newOwner || newOwner.householdId !== existingMember.householdId) {
        return NextResponse.json(
          { error: 'Invalid new owner selected' },
          { status: 400 }
        )
      }
      
      // Use transaction to update everything atomically
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update the household to set new owner
        await tx.household.update({
          where: { id: existingMember.ownedHousehold!.id },
          data: { ownerId: data.newOwnerId }
        })
        
        // 2. Delete pending payments for this household
        await tx.payment.deleteMany({
          where: {
            householdId: existingMember.ownedHousehold!.id,
            status: 'pending'
          }
        })
        
        // 3. Update the old owner (moving out)
        const updatedMember = await tx.householdMember.update({
          where: { id: params.id },
          data: {
            name: data.name,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            cccd: data.cccd,
            profilePic: data.profilePic !== undefined ? (data.profilePic || null) : undefined,
            householdId: null, // Remove from household when moved out
            residenceType: data.residenceType,
            relationToOwner: null, // Clear relation when moved out
            status: 'moved_out',
            moveInDate: data.moveInDate ? new Date(data.moveInDate) : undefined,
            moveOutDate: data.moveOutDate ? new Date(data.moveOutDate) : null,
            note: data.note !== undefined ? (data.note || null) : undefined
          },
          include: {
            household: {
              select: {
                id: true,
                unit: true,
                ownerId: true
              }
            }
          }
        })
        
        return updatedMember
      })
      
      return NextResponse.json({
        ...result,
        ownerChanged: true,
        pendingPaymentsDeleted: true
      })
    }

    // Regular update (non-owner or not moving out)
    const member = await prisma.householdMember.update({
      where: { id: params.id },
      data: {
        name: data.name,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        cccd: data.cccd,
        profilePic: data.profilePic !== undefined ? (data.profilePic || null) : undefined,
        householdId: data.status === 'moved_out' ? null : (data.householdId !== undefined ? (data.householdId || null) : undefined),
        residenceType: data.residenceType,
        relationToOwner: data.status === 'moved_out' ? null : (data.relationToOwner !== undefined ? (data.relationToOwner || null) : undefined),
        status: data.status,
        moveInDate: data.moveInDate ? new Date(data.moveInDate) : undefined,
        moveOutDate: data.moveOutDate !== undefined ? (data.moveOutDate ? new Date(data.moveOutDate) : null) : undefined,
        note: data.note !== undefined ? (data.note || null) : undefined
      },
      include: {
        household: {
          select: {
            id: true,
            unit: true,
            ownerId: true
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
