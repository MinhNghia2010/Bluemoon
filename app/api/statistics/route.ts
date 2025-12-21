import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const MAX_PARKING_SLOTS = 500
    const MAX_PARKING_HOUSEHOLDS = 100

    // All Prisma queries in parallel - no raw SQL for Vercel compatibility
    const [
      totalHouseholds,
      activeHouseholds,
      totalResidents,
      totalPayments,
      pendingPayments,
      collectedPayments,
      overduePayments,
      paymentsCollected,
      paymentsPending,
      paymentsOverdue,
      totalParkingSlots,
      totalUtilityBills,
      pendingUtilityBills,
      paidUtilityBills,
      overdueUtilityBills,
      utilitiesPaid,
      utilitiesPending,
      utilitiesOverdue,
      utilityTotals,
      parkingRevenue,
      parkingByType,
      parkingHouseholds,
      recentPayments,
      recentUtilities,
      categoryDistribution
    ] = await Promise.all([
      // Counts
      prisma.household.count(),
      prisma.household.count({ where: { status: 'active' } }),
      prisma.householdMember.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'pending' } }),
      prisma.payment.count({ where: { status: 'collected' } }),
      prisma.payment.count({ where: { status: 'overdue' } }),
      // Payment sums
      prisma.payment.aggregate({ where: { status: 'collected' }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'pending' }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'overdue' }, _sum: { amount: true } }),
      // Parking & Utility counts
      prisma.parkingSlot.count(),
      prisma.utilityBill.count(),
      prisma.utilityBill.count({ where: { status: 'pending' } }),
      prisma.utilityBill.count({ where: { status: 'paid' } }),
      prisma.utilityBill.count({ where: { status: 'overdue' } }),
      // Utility sums
      prisma.utilityBill.aggregate({ where: { status: 'paid' }, _sum: { totalAmount: true } }),
      prisma.utilityBill.aggregate({ where: { status: 'pending' }, _sum: { totalAmount: true } }),
      prisma.utilityBill.aggregate({ where: { status: 'overdue' }, _sum: { totalAmount: true } }),
      prisma.utilityBill.aggregate({ _sum: { electricityCost: true, waterCost: true, internetCost: true } }),
      // Parking
      prisma.parkingSlot.aggregate({ _sum: { monthlyFee: true } }),
      prisma.parkingSlot.groupBy({ by: ['type'], _count: true }),
      prisma.parkingSlot.findMany({ where: { householdId: { not: null } }, select: { householdId: true }, distinct: ['householdId'] }),
      // Recent data
      prisma.payment.findMany({
        where: { dueDate: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        select: { amount: true, status: true, dueDate: true }
      }),
      prisma.utilityBill.findMany({
        where: { dueDate: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
        select: { totalAmount: true, status: true, dueDate: true }
      }),
      prisma.feeCategory.findMany({
        select: { name: true, amount: true, _count: { select: { payments: true } } }
      })
    ])

    // Extract values
    const paymentsCollectedSum = paymentsCollected._sum.amount || 0
    const paymentsPendingSum = paymentsPending._sum.amount || 0
    const paymentsOverdueSum = paymentsOverdue._sum.amount || 0
    const utilitiesPaidSum = utilitiesPaid._sum.totalAmount || 0
    const utilitiesPendingSum = utilitiesPending._sum.totalAmount || 0
    const utilitiesOverdueSum = utilitiesOverdue._sum.totalAmount || 0
    const electricitySum = utilityTotals._sum.electricityCost || 0
    const waterSum = utilityTotals._sum.waterCost || 0
    const internetSum = utilityTotals._sum.internetCost || 0
    const monthlyParkingRevenue = parkingRevenue._sum.monthlyFee || 0
    const parkingHouseholdsCount = parkingHouseholds.length
    const carCount = parkingByType.find(p => p.type === 'car')?._count || 0
    const motorcycleCount = parkingByType.find(p => p.type === 'motorcycle')?._count || 0
    const bicycleCount = parkingByType.find(p => p.type === 'bicycle')?._count || 0

    // Monthly revenue calculation
    const monthlyRevenue: { [key: string]: { collected: number, pending: number, overdue: number } } = {}
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      monthlyRevenue[date.toISOString().slice(0, 7)] = { collected: 0, pending: 0, overdue: 0 }
    }

    recentPayments.forEach(p => {
      const key = p.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[key]) {
        if (p.status === 'collected') monthlyRevenue[key].collected += p.amount
        else if (p.status === 'pending') monthlyRevenue[key].pending += p.amount
        else if (p.status === 'overdue') monthlyRevenue[key].overdue += p.amount
      }
    })

    recentUtilities.forEach(u => {
      const key = u.dueDate.toISOString().slice(0, 7)
      if (monthlyRevenue[key]) {
        if (u.status === 'paid') monthlyRevenue[key].collected += u.totalAmount
        else if (u.status === 'pending') monthlyRevenue[key].pending += u.totalAmount
        else if (u.status === 'overdue') monthlyRevenue[key].overdue += u.totalAmount
      }
    })

    const feeCollectionRate = totalPayments > 0 ? Math.round((collectedPayments / totalPayments) * 100) : 0
    const utilityCollectionRate = totalUtilityBills > 0 ? Math.round((paidUtilityBills / totalUtilityBills) * 100) : 0
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
        occupiedParkingSlots: totalParkingSlots,
        availableParkingSlots: MAX_PARKING_SLOTS - totalParkingSlots,
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
        occupied: totalParkingSlots,
        available: MAX_PARKING_SLOTS - totalParkingSlots,
        maxSlots: MAX_PARKING_SLOTS,
        maxHouseholds: MAX_PARKING_HOUSEHOLDS,
        householdsWithParking: parkingHouseholdsCount,
        availableHouseholdSlots: MAX_PARKING_HOUSEHOLDS - parkingHouseholdsCount,
        monthlyRevenue: monthlyParkingRevenue,
        byType: { car: carCount, motorcycle: motorcycleCount, bicycle: bicycleCount }
      },
      financials: {
        totalCollected,
        totalPending,
        totalOverdue,
        grandTotal: totalCollected + totalPending + totalOverdue
      },
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, data]) => ({
        month, ...data, total: data.collected + data.pending + data.overdue
      })).sort((a, b) => a.month.localeCompare(b.month)),
      categoryDistribution: categoryDistribution.map(cat => ({
        name: cat.name,
        count: cat._count.payments,
        amount: cat.amount,
        totalValue: cat._count.payments * cat.amount
      }))
    })
  } catch (error) {
    console.error('Statistics error:', error)
    return NextResponse.json({ error: 'Failed to load statistics' }, { status: 500 })
  }
}
