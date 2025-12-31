import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET single household
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch all data in parallel for speed
    const [household, members, payments, parkingSlots, utilityBills] = await Promise.all([
      prisma.household.findUnique({
        where: { id },
        select: {
          id: true, unit: true, ownerId: true,
          owner: {
            select: { id: true, name: true, cccd: true, profilePic: true }
          },
          area: true, floor: true,
          moveInDate: true, phone: true, email: true, status: true, balance: true
        }
      }),
      prisma.householdMember.findMany({
        where: { householdId: id },
        select: { id: true, name: true, dateOfBirth: true, cccd: true, profilePic: true, status: true, residenceType: true, relationToOwner: true }
      }),
      prisma.payment.findMany({
        where: { householdId: id },
        select: { id: true, amount: true, status: true, dueDate: true, paymentDate: true, feeCategory: { select: { name: true } } },
        orderBy: { dueDate: 'desc' },
        take: 20
      }),
      prisma.parkingSlot.findMany({
        where: { householdId: id },
        select: { id: true, slotNumber: true, type: true, licensePlate: true, monthlyFee: true }
      }),
      prisma.utilityBill.findMany({
        where: { householdId: id },
        select: { id: true, month: true, totalAmount: true, status: true, dueDate: true },
        orderBy: { dueDate: 'desc' },
        take: 12
      })
    ])

    if (!household) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...household,
      ownerName: household.owner?.name || 'No owner',
      members,
      payments,
      parkingSlots,
      utilityBills,
      residents: members.filter(m => m.status === 'living').length
    })
  } catch (error) {
    console.error('Get household error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update household
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Get current household state
    const currentHousehold = await prisma.household.findUnique({
      where: { id },
      select: { 
        ownerId: true,
        owner: { select: { id: true, status: true } }
      }
    })

    if (!currentHousehold) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 })
    }

    // Check if owner is being removed (set to null)
    const isRemovingOwner = data.ownerId === null && currentHousehold.ownerId !== null
    
    // If removing owner, check if owner moved out but still owns (status = moved_out but relation maintained)
    // In this case, we don't cascade delete
    const ownerMovedOutButStillOwns = currentHousehold.owner?.status === 'moved_out'
    
    if (isRemovingOwner && !ownerMovedOutButStillOwns) {
      // Owner is being completely removed - cascade delete related data
      // Keep temporary residents, delete permanent residents and all payments/vehicles
      await prisma.$transaction(async (tx) => {
        // Delete all payments for this household
        await tx.payment.deleteMany({
          where: { householdId: id }
        })
        
        // Release all parking slots (set householdId to null)
        await tx.parkingSlot.updateMany({
          where: { householdId: id },
          data: { householdId: null, licensePlate: null, status: 'available' }
        })
        
        // Delete utility bills
        await tx.utilityBill.deleteMany({
          where: { householdId: id }
        })
        
        // Remove permanent residents from household (keep temporary ones)
        await tx.householdMember.updateMany({
          where: { 
            householdId: id,
            residenceType: 'permanent'
          },
          data: { 
            householdId: null,
            status: 'moved_out',
            moveOutDate: new Date()
          }
        })
        
        // Reset household balance
        await tx.household.update({
          where: { id },
          data: { 
            ownerId: null,
            balance: 0
          }
        })
      })
      
      // Fetch updated household
      const updatedHousehold = await prisma.household.findUnique({
        where: { id },
        include: {
          members: { where: { status: 'living' } },
          owner: { select: { id: true, name: true } }
        }
      })
      
      return NextResponse.json({ 
        ...updatedHousehold, 
        ownerName: 'No owner',
        residents: updatedHousehold?.members.length || 0,
        cascadeDeleted: true,
        message: 'Owner removed. All payments, vehicles, and permanent residents have been removed from this household.'
      })
    }

    const household = await prisma.household.update({
      where: { id },
      data: {
        ownerId: data.ownerId !== undefined ? (data.ownerId || null) : undefined,
        area: data.area !== undefined ? (data.area ? parseFloat(data.area) : null) : undefined,
        floor: data.floor !== undefined ? (data.floor ? parseInt(data.floor) : null) : undefined,
        moveInDate: data.moveInDate !== undefined ? (data.moveInDate ? new Date(data.moveInDate) : null) : undefined,
        phone: data.phone,
        email: data.email,
        status: data.status
      },
      include: {
        members: {
          where: { status: 'living' }
        },
        owner: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ 
      ...household, 
      ownerName: household.owner?.name || 'No owner',
      residents: household.members.length 
    })
  } catch (error) {
    console.error('Update household error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE household
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check for unpaid fees (payments with status pending or overdue)
    const unpaidPayments = await prisma.payment.findMany({
      where: {
        householdId: id,
        status: { in: ['pending', 'overdue'] }
      },
      include: {
        feeCategory: { select: { name: true } }
      }
    })

    // Check for unpaid utility bills
    const unpaidUtilityBills = await prisma.utilityBill.findMany({
      where: {
        householdId: id,
        status: { in: ['pending', 'overdue'] }
      }
    })

    // Check for parking slots with unpaid fees (occupied slots = active fees)
    const parkingSlots = await prisma.parkingSlot.findMany({
      where: {
        householdId: id,
        status: 'occupied'
      }
    })

    // If there are any unpaid bills, return error with details
    if (unpaidPayments.length > 0 || unpaidUtilityBills.length > 0 || parkingSlots.length > 0) {
      const unpaidItems = []
      
      if (unpaidPayments.length > 0) {
        const totalFees = unpaidPayments.reduce((sum, p) => sum + p.amount, 0)
        unpaidItems.push(`${unpaidPayments.length} unpaid fee(s) totaling $${totalFees.toFixed(2)}`)
      }
      
      if (unpaidUtilityBills.length > 0) {
        const totalUtility = unpaidUtilityBills.reduce((sum, u) => sum + u.totalAmount, 0)
        unpaidItems.push(`${unpaidUtilityBills.length} unpaid utility bill(s) totaling $${totalUtility.toFixed(2)}`)
      }
      
      if (parkingSlots.length > 0) {
        unpaidItems.push(`${parkingSlots.length} active parking slot(s) that need to be released`)
      }

      return NextResponse.json(
        { 
          error: 'Cannot delete household with unpaid bills',
          hasUnpaidBills: true,
          unpaidPayments: unpaidPayments.length,
          unpaidUtilityBills: unpaidUtilityBills.length,
          activeParkingSlots: parkingSlots.length,
          details: unpaidItems.join(', ')
        },
        { status: 400 }
      )
    }

    // If all bills are paid, proceed with deletion
    await prisma.household.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Household deleted successfully' })
  } catch (error) {
    console.error('Delete household error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

