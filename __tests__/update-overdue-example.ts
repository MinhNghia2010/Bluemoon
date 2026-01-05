import { prisma } from '@/lib/db'

/**
 * Real Example: Database Trigger for Automatic Overdue Status
 * 
 * This demonstrates that the PostgreSQL trigger automatically changes
 * 'pending' to 'overdue' when a payment/utility bill is inserted or updated
 * with a due date in the past.
 */

async function demonstrateDatabaseTrigger() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  console.log('=== Database Trigger Demo: Automatic Overdue Status ===\n')
  console.log(`Current Date: ${today.toISOString().split('T')[0]}\n`)

  // Get a household and fee category for testing
  const household = await prisma.household.findFirst()
  const feeCategory = await prisma.feeCategory.findFirst()

  if (!household || !feeCategory) {
    console.log('❌ No household or fee category found for testing')
    return
  }

  console.log(`📋 Using Household: Unit ${household.unit}`)
  console.log(`📋 Using Fee Category: ${feeCategory.name}\n`)

  // Test 1: Insert a payment with PAST due date and 'pending' status
  console.log('🧪 TEST 1: Insert payment with PAST due date as "pending"')
  const pastDueDate = new Date()
  pastDueDate.setDate(pastDueDate.getDate() - 30) // 30 days ago

  const testPayment1 = await prisma.payment.create({
    data: {
      householdId: household.id,
      feeCategoryId: feeCategory.id,
      amount: 999.99,
      dueDate: pastDueDate,
      status: 'pending', // We're setting it as pending
      notes: 'Test: DB trigger should change this to overdue'
    }
  })

  console.log(`   Input status: "pending"`)
  console.log(`   Input dueDate: ${pastDueDate.toISOString().split('T')[0]} (30 days ago)`)
  console.log(`   ✅ Output status from DB: "${testPayment1.status}"`)
  console.log(`   ${testPayment1.status === 'overdue' ? '🎉 TRIGGER WORKED!' : '❌ Trigger did not fire'}\n`)

  // Test 2: Insert a payment with FUTURE due date and 'pending' status
  console.log('🧪 TEST 2: Insert payment with FUTURE due date as "pending"')
  const futureDueDate = new Date()
  futureDueDate.setDate(futureDueDate.getDate() + 30) // 30 days from now

  const testPayment2 = await prisma.payment.create({
    data: {
      householdId: household.id,
      feeCategoryId: feeCategory.id,
      amount: 888.88,
      dueDate: futureDueDate,
      status: 'pending',
      notes: 'Test: DB trigger should keep this as pending'
    }
  })

  console.log(`   Input status: "pending"`)
  console.log(`   Input dueDate: ${futureDueDate.toISOString().split('T')[0]} (30 days from now)`)
  console.log(`   ✅ Output status from DB: "${testPayment2.status}"`)
  console.log(`   ${testPayment2.status === 'pending' ? '🎉 CORRECT! Still pending' : '❌ Unexpected status'}\n`)

  // Test 3: Update a payment to 'pending' when due date is in the past
  console.log('🧪 TEST 3: Update payment status to "pending" when due date is past')
  const updated = await prisma.payment.update({
    where: { id: testPayment1.id },
    data: { status: 'pending' } // Try to set it back to pending
  })

  console.log(`   Attempted to set status: "pending"`)
  console.log(`   Due date: ${pastDueDate.toISOString().split('T')[0]} (past)`)
  console.log(`   ✅ Actual status from DB: "${updated.status}"`)
  console.log(`   ${updated.status === 'overdue' ? '🎉 TRIGGER PREVENTED invalid status!' : '❌ Trigger did not fire'}\n`)

  // Clean up test data
  console.log('🧹 Cleaning up test payments...')
  await prisma.payment.deleteMany({
    where: { 
      notes: { startsWith: 'Test: DB trigger' }
    }
  })
  console.log('   ✅ Test payments deleted\n')

  // Show current overdue statistics
  const stats = await prisma.payment.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  console.log('📊 Current Payment Statistics:')
  stats.forEach(item => {
    const emoji = item.status === 'overdue' ? '🔴' : item.status === 'pending' ? '🟡' : '🟢'
    console.log(`   ${emoji} ${item.status}: ${item._count.status} payments`)
  })

  console.log('\n=== Demo Complete ===')
  console.log('\n💡 The database trigger automatically:')
  console.log('   • Changes "pending" → "overdue" when dueDate < today')
  console.log('   • Runs on INSERT and UPDATE operations')
  console.log('   • Works at the database level (no API call needed)')
}

// Run the demo
demonstrateDatabaseTrigger()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
