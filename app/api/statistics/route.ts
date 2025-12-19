import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get counts
    const [
      totalHouseholds,
      activeHouseholds,
      totalPayments,
      pendingPayments,
      collectedPayments,
      overduePayments,
      totalParkingSlots,
      occupiedParkingSlots,
      availableParkingSlots,
      totalUtilityBills,
      pendingUtilityBills,
      paidUtilityBills,
      overdueUtilityBills
    ] = await Promise.all([
      prisma.household.count(),
      prisma.household.count({ where: { status: 'active' } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'pending' } }),
      prisma.payment.count({ where: { status: 'collected' } }),
      prisma.payment.count({ where: { status: 'overdue' } }),
      prisma.parkingSlot.count(),
      prisma.parkingSlot.count({ where: { status: 'occupied' } }),
      prisma.parkingSlot.count({ where: { status: 'available' } }),
      prisma.utilityBill.count(),
      prisma.utilityBill.count({ where: { status: 'pending' } }),
      prisma.utilityBill.count({ where: { status: 'paid' } }),
      prisma.utilityBill.count({ where: { status: 'overdue' } })
    ])

    // Get financial summaries for Fee Payments
    const [
      paymentsCollected,
      paymentsPending,
      paymentsOverdue
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: 'collected' },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { status: 'overdue' },
        _sum: { amount: true }
      })
    ])

    // Get financial summaries for Utility Bills
    const [
      utilitiesPaid,
      utilitiesPending,
      utilitiesOverdue
    ] = await Promise.all([
      prisma.utilityBill.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true }
      }),
      prisma.utilityBill.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true }
      }),
      prisma.utilityBill.aggregate({
        where: { status: 'overdue' },
        _sum: { amount: true }
      })
    ])

    // Get utility bills by type
    const [
      electricityTotal,
      waterTotal,
      internetTotal,
      gasTotal
    ] = await Promise.all([
      prisma.utilityBill.aggregate({
        where: { type: 'electricity' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.utilityBill.aggregate({
        where: { type: 'water' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.utilityBill.aggregate({
        where: { type: 'internet' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.utilityBill.aggregate({
        where: { type: 'gas' },
        _sum: { amount: true },
        _count: true
      })
    ])

    // Get parking revenue
    const parkingSlots = await prisma.parkingSlot.findMany({
      where: { status: 'occupied' }
    })
    const monthlyParkingRevenue = parkingSlots.reduce((sum, slot) => sum + slot.monthlyFee, 0)

    // Get parking by type
    const [
      carSlots,
      motorcycleSlots,
      bicycleSlots
    ] = await Promise.all([
      prisma.parkingSlot.aggregate({
        where: { type: 'car' },
        _count: true
      }),
      prisma.parkingSlot.aggregate({
        where: { type: 'motorcycle' },
        _count: true
      }),
      prisma.parkingSlot.aggregate({
        where: { type: 'bicycle' },
        _count: true
      })
    ])

    // Get monthly data for the last 6 months with status breakdown
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Get all payments with their status and dates
    const allPayments = await prisma.payment.findMany({
      where: {
        dueDate: { gte: sixMonthsAgo }
      },
      select: {
        amount: true,
        status: true,
        dueDate: true,
        paymentDate: true
      }
    })

    // Get all utility bills with their status and dates
    const allUtilities = await prisma.utilityBill.findMany({
      where: {
        dueDate: { gte: sixMonthsAgo }
      },
      select: {
        amount: true,
        status: true,
        dueDate: true,
        paidDate: true,
        type: true
      }
    })

    // Initialize last 6 months
    const monthlyRevenue: { [key: string]: { collected: number, pending: number, overdue: number } } = {}
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      monthlyRevenue[monthKey] = { collected: 0, pending: 0, overdue: 0 }
    }

    // Group payments by month and status
    allPayments.forEach(payment => {
      const monthKey = payment.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[monthKey]) {
        if (payment.status === 'collected') {
          monthlyRevenue[monthKey].collected += payment.amount
        } else if (payment.status === 'pending') {
          monthlyRevenue[monthKey].pending += payment.amount
        } else if (payment.status === 'overdue') {
          monthlyRevenue[monthKey].overdue += payment.amount
        }
      }
    })

    // Group utilities by month and status
    allUtilities.forEach(bill => {
      const monthKey = bill.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[monthKey]) {
        if (bill.status === 'paid') {
          monthlyRevenue[monthKey].collected += bill.amount
        } else if (bill.status === 'pending') {
          monthlyRevenue[monthKey].pending += bill.amount
        } else if (bill.status === 'overdue') {
          monthlyRevenue[monthKey].overdue += bill.amount
        }
      }
    })

    // Get category distribution
    const categoryDistribution = await prisma.feeCategory.findMany({
      include: {
        _count: {
          select: { payments: true }
        }
      }
    })

    // Calculate overall collection rates
    const totalFeePayments = totalPayments
    const collectedFeePayments = collectedPayments
    const feeCollectionRate = totalFeePayments > 0 
      ? Math.round((collectedFeePayments / totalFeePayments) * 100) 
      : 0

    const totalUtilityPayments = totalUtilityBills
    const paidUtilityPayments = paidUtilityBills
    const utilityCollectionRate = totalUtilityPayments > 0 
      ? Math.round((paidUtilityPayments / totalUtilityPayments) * 100) 
      : 0

    // Overall totals
    const totalCollected = (paymentsCollected._sum.amount || 0) + (utilitiesPaid._sum.amount || 0)
    const totalPending = (paymentsPending._sum.amount || 0) + (utilitiesPending._sum.amount || 0)
    const totalOverdue = (paymentsOverdue._sum.amount || 0) + (utilitiesOverdue._sum.amount || 0)

    return NextResponse.json({
      overview: {
        totalHouseholds,
        activeHouseholds,
        // Fee Payments
        totalPayments,
        pendingPayments,
        collectedPayments,
        overduePayments,
        feeCollectionRate,
        // Utility Bills
        totalUtilityBills,
        pendingUtilityBills,
        paidUtilityBills,
        overdueUtilityBills,
        utilityCollectionRate,
        // Parking
        totalParkingSlots,
        occupiedParkingSlots,
        availableParkingSlots
      },
      // Fee Payments financials
      feePayments: {
        collected: paymentsCollected._sum.amount || 0,
        pending: paymentsPending._sum.amount || 0,
        overdue: paymentsOverdue._sum.amount || 0,
        total: (paymentsCollected._sum.amount || 0) + (paymentsPending._sum.amount || 0) + (paymentsOverdue._sum.amount || 0)
      },
      // Utility Bills financials
      utilities: {
        paid: utilitiesPaid._sum.amount || 0,
        pending: utilitiesPending._sum.amount || 0,
        overdue: utilitiesOverdue._sum.amount || 0,
        total: (utilitiesPaid._sum.amount || 0) + (utilitiesPending._sum.amount || 0) + (utilitiesOverdue._sum.amount || 0),
        byType: {
          electricity: { amount: electricityTotal._sum.amount || 0, count: electricityTotal._count },
          water: { amount: waterTotal._sum.amount || 0, count: waterTotal._count },
          internet: { amount: internetTotal._sum.amount || 0, count: internetTotal._count },
          gas: { amount: gasTotal._sum.amount || 0, count: gasTotal._count }
        }
      },
      // Parking financials
      parking: {
        total: totalParkingSlots,
        occupied: occupiedParkingSlots,
        available: availableParkingSlots,
        monthlyRevenue: monthlyParkingRevenue,
        byType: {
          car: carSlots._count,
          motorcycle: motorcycleSlots._count,
          bicycle: bicycleSlots._count
        }
      },
      // Combined financials
      financials: {
        totalCollected,
        totalPending,
        totalOverdue,
        grandTotal: totalCollected + totalPending + totalOverdue
      },
      // Monthly revenue breakdown by status
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, data]) => ({
        month,
        collected: data.collected,
        pending: data.pending,
        overdue: data.overdue,
        total: data.collected + data.pending + data.overdue
      })).sort((a, b) => a.month.localeCompare(b.month)),
      // Category distribution
      categoryDistribution: categoryDistribution.map(cat => ({
        name: cat.name,
        count: cat._count.payments,
        amount: cat.amount,
        totalValue: cat._count.payments * cat.amount
      }))
    })
  } catch (error) {
    console.error('Get statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
