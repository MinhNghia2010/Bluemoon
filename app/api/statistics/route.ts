import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Parking capacity constants
    const MAX_PARKING_SLOTS = 500
    const MAX_PARKING_HOUSEHOLDS = 100

    // Use Prisma queries instead of raw SQL for better Vercel compatibility
    const [
      // Counts
      totalHouseholds,
      activeHouseholds,
      totalResidents,
      totalPayments,
      pendingPayments,
      collectedPayments,
      overduePayments,
      totalParkingSlots,
      totalUtilityBills,
      pendingUtilityBills,
      paidUtilityBills,
      overdueUtilityBills,
      // Aggregates
      paymentAggregates,
      utilityAggregates,
      parkingAggregates,
      // Recent data
      recentPayments,
      recentUtilities,
      categoryDistribution
    ] = await Promise.all([
      // Counts using Prisma
      prisma.household.count(),
      prisma.household.count({ where: { status: 'active' } }),
      prisma.householdMember.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'pending' } }),
      prisma.payment.count({ where: { status: 'collected' } }),
      prisma.payment.count({ where: { status: 'overdue' } }),
      prisma.parkingSlot.count(),
      prisma.utilityBill.count(),
      prisma.utilityBill.count({ where: { status: 'pending' } }),
      prisma.utilityBill.count({ where: { status: 'paid' } }),
      prisma.utilityBill.count({ where: { status: 'overdue' } }),
      // Payment aggregates
      prisma.payment.groupBy({
        by: ['status'],
        _sum: { amount: true }
      }),
      // Utility aggregates
      prisma.utilityBill.aggregate({
        _sum: {
          totalAmount: true,
          electricityCost: true,
          waterCost: true,
          internetCost: true
        }
      }),
      // Parking aggregates
      prisma.parkingSlot.aggregate({
        _sum: { monthlyFee: true },
        _count: { _all: true }
      }),
      // Monthly data (last 6 months)
      prisma.payment.findMany({
        where: { dueDate: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        select: { amount: true, status: true, dueDate: true }
      }),
      prisma.utilityBill.findMany({
        where: { dueDate: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        select: { totalAmount: true, status: true, dueDate: true }
      }),
      // Category distribution
      prisma.feeCategory.findMany({
        select: { name: true, amount: true, _count: { select: { payments: true } } }
      })
    ])

    // Get additional parking data
    const [parkingHouseholdsCount, parkingByType] = await Promise.all([
      prisma.parkingSlot.groupBy({
        by: ['householdId'],
        where: { householdId: { not: null } }
      }).then(result => result.length),
      prisma.parkingSlot.groupBy({
        by: ['type'],
        _count: { _all: true }
      })
    ])

    // Extract payment aggregates
    const paymentsCollectedSum = paymentAggregates.find(p => p.status === 'collected')?._sum?.amount || 0
    const paymentsPendingSum = paymentAggregates.find(p => p.status === 'pending')?._sum?.amount || 0
    const paymentsOverdueSum = paymentAggregates.find(p => p.status === 'overdue')?._sum?.amount || 0

    // Extract utility aggregates with status-based breakdown
    const [utilityPaidSum, utilityPendingSum, utilityOverdueSum] = await Promise.all([
      prisma.utilityBill.aggregate({ where: { status: 'paid' }, _sum: { totalAmount: true } }),
      prisma.utilityBill.aggregate({ where: { status: 'pending' }, _sum: { totalAmount: true } }),
      prisma.utilityBill.aggregate({ where: { status: 'overdue' }, _sum: { totalAmount: true } })
    ])

    const utilitiesPaidSum = utilityPaidSum._sum.totalAmount || 0
    const utilitiesPendingSum = utilityPendingSum._sum.totalAmount || 0
    const utilitiesOverdueSum = utilityOverdueSum._sum.totalAmount || 0
    const electricitySum = utilityAggregates._sum.electricityCost || 0
    const waterSum = utilityAggregates._sum.waterCost || 0
    const internetSum = utilityAggregates._sum.internetCost || 0

    // Parking data
    const monthlyParkingRevenue = parkingAggregates._sum.monthlyFee || 0
    const occupiedParkingSlots = totalParkingSlots
    const availableParkingSlots = MAX_PARKING_SLOTS - totalParkingSlots

    // Extract parking by type
    const carCount = parkingByType.find(p => p.type === 'car')?._count._all || 0
    const motorcycleCount = parkingByType.find(p => p.type === 'motorcycle')?._count._all || 0
    const bicycleCount = parkingByType.find(p => p.type === 'bicycle')?._count._all || 0

    // Initialize last 6 months
    const monthlyRevenue: { [key: string]: { collected: number, pending: number, overdue: number } } = {}
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      monthlyRevenue[date.toISOString().slice(0, 7)] = { collected: 0, pending: 0, overdue: 0 }
    }

    // Group payments by month
    recentPayments.forEach(p => {
      const key = p.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[key]) {
        if (p.status === 'collected') monthlyRevenue[key].collected += p.amount
        else if (p.status === 'pending') monthlyRevenue[key].pending += p.amount
        else if (p.status === 'overdue') monthlyRevenue[key].overdue += p.amount
      }
    })

    // Group utilities by month
    recentUtilities.forEach(u => {
      const key = u.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[key]) {
        if (u.status === 'paid') monthlyRevenue[key].collected += u.totalAmount
        else if (u.status === 'pending') monthlyRevenue[key].pending += u.totalAmount
        else if (u.status === 'overdue') monthlyRevenue[key].overdue += u.totalAmount
      }
    })

    // Calculate rates
    const feeCollectionRate = totalPayments > 0 ? Math.round((collectedPayments / totalPayments) * 100) : 0
    const utilityCollectionRate = totalUtilityBills > 0 ? Math.round((paidUtilityBills / totalUtilityBills) * 100) : 0

    // Totals
    const totalCollected = paymentsCollectedSum + utilitiesPaidSum + monthlyParkingRevenue
    const totalPending = paymentsPendingSum + utilitiesPendingSum
    const totalOverdue = paymentsOverdueSum + utilitiesOverdueSum

    return NextResponse.json({
      overview: {
        totalHouseholds,
        activeHouseholds,
        totalResidents,
        totalPayments,
        pendingPayments,
        collectedPayments,
        overduePayments,
        feeCollectionRate,
        totalUtilityBills,
        pendingUtilityBills,
        paidUtilityBills,
        overdueUtilityBills,
        utilityCollectionRate,
        totalParkingSlots,
        occupiedParkingSlots,
        availableParkingSlots,
        maxParkingSlots: MAX_PARKING_SLOTS,
        maxParkingHouseholds: MAX_PARKING_HOUSEHOLDS,
        parkingHouseholdsCount,
        availableParkingHouseholdSlots: MAX_PARKING_HOUSEHOLDS - parkingHouseholdsCount
      },
      feePayments: {
        collected: paymentsCollectedSum,
        pending: paymentsPendingSum,
        overdue: paymentsOverdueSum,
        total: paymentsCollectedSum + paymentsPendingSum + paymentsOverdueSum
      },
      utilities: {
        paid: utilitiesPaidSum,
        pending: utilitiesPendingSum,
        overdue: utilitiesOverdueSum,
        total: utilitiesPaidSum + utilitiesPendingSum + utilitiesOverdueSum,
        byType: {
          electricity: { amount: electricitySum, count: totalUtilityBills },
          water: { amount: waterSum, count: totalUtilityBills },
          internet: { amount: internetSum, count: totalUtilityBills },
          gas: { amount: 0, count: 0 }
        }
      },
      parking: {
        total: totalParkingSlots,
        occupied: occupiedParkingSlots,
        available: availableParkingSlots,
        maxSlots: MAX_PARKING_SLOTS,
        maxHouseholds: MAX_PARKING_HOUSEHOLDS,
        householdsWithParking: parkingHouseholdsCount,
        availableHouseholdSlots: MAX_PARKING_HOUSEHOLDS - parkingHouseholdsCount,
        monthlyRevenue: monthlyParkingRevenue,
        byType: {
          car: carCount,
          motorcycle: motorcycleCount,
          bicycle: bicycleCount
        }
      },
      financials: {
        totalCollected,
        totalPending,
        totalOverdue,
        grandTotal: totalCollected + totalPending + totalOverdue
      },
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, data]) => ({
        month,
        ...data,
        total: data.collected + data.pending + data.overdue
      })).sort((a, b) => a.month.localeCompare(b.month)),
      categoryDistribution: categoryDistribution.map(cat => ({
        name: cat.name,
        count: cat._count.payments,
        amount: cat.amount,
        totalValue: cat._count.payments * cat.amount
      }))
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=59'
      }
    })
  } catch (error) {
    // Log detailed error for debugging on Vercel
    console.error('Get statistics error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error details:', { message: errorMessage, stack: errorStack })
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
