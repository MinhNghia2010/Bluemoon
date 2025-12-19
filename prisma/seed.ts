import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data first (in correct order due to foreign keys)
  console.log('🧹 Cleaning existing data...')
  await prisma.payment.deleteMany()
  await prisma.utilityBill.deleteMany()
  await prisma.parkingSlot.deleteMany()
  await prisma.householdMember.deleteMany()
  await prisma.feeCategory.deleteMany()
  await prisma.household.deleteMany()
  await prisma.setting.deleteMany()
  // Keep users to preserve login
  console.log('✅ Database cleaned')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      email: 'admin@bluemoon.com',
      role: 'admin'
    }
  })
  console.log('✅ Created admin user:', admin.username)

  // Create fee categories (English) - Parking fees are managed separately in Parking section
  const categories = await Promise.all([
    prisma.feeCategory.upsert({
      where: { name: 'Management Fee' },
      update: {},
      create: {
        name: 'Management Fee',
        amount: 150,
        frequency: 'monthly',
        description: 'Monthly apartment management fee'
      }
    }),
    prisma.feeCategory.upsert({
      where: { name: 'Service Fee' },
      update: {},
      create: {
        name: 'Service Fee',
        amount: 50,
        frequency: 'monthly',
        description: 'Service fee (security, cleaning, garbage collection)'
      }
    }),
    prisma.feeCategory.upsert({
      where: { name: 'Maintenance Fund' },
      update: {},
      create: {
        name: 'Maintenance Fund',
        amount: 500,
        frequency: 'annual',
        description: 'Annual building maintenance and repair fund'
      }
    })
  ])
  console.log('✅ Created', categories.length, 'fee categories')

  // Create sample households
  const households = await Promise.all([
    prisma.household.upsert({
      where: { unit: '101' },
      update: {},
      create: {
        unit: '101',
        ownerName: 'Doctor who',
        area: 70,
        floor: 1,
        moveInDate: new Date('2025-12-01'),
        phone: '0901234567',
        email: 'doctorwho@email.com',
        status: 'active'
      }
    }),
    prisma.household.upsert({
      where: { unit: '102' },
      update: {},
      create: {
        unit: '102',
        ownerName: 'Doctor 12',
        area: 65,
        floor: 1,
        moveInDate: new Date('2025-12-02'),
        phone: '0912345678',
        email: 'doctor12@email.com',
        status: 'active'
      }
    }),
    prisma.household.upsert({
      where: { unit: '103' },
      update: {},
      create: {
        unit: '103',
        ownerName: 'Lê Vũ Nguyên Hoàng',
        area: 75,
        floor: 1,
        moveInDate: new Date('2025-11-12'),
        phone: '0923456789',
        email: 'hoang.le@email.com',
        status: 'active'
      }
    }),
    prisma.household.upsert({
      where: { unit: '201' },
      update: {},
      create: {
        unit: '201',
        ownerName: 'David Wilson',
        area: 80,
        floor: 2,
        moveInDate: new Date('2025-10-15'),
        phone: '0934567890',
        email: 'david.wilson@email.com',
        status: 'active'
      }
    }),
    prisma.household.upsert({
      where: { unit: '202' },
      update: {},
      create: {
        unit: '202',
        ownerName: 'Emily Brown',
        area: 70,
        floor: 2,
        moveInDate: new Date('2025-09-01'),
        phone: '0945678901',
        email: 'emily.brown@email.com',
        status: 'active'
      }
    }),
    prisma.household.upsert({
      where: { unit: '301' },
      update: {},
      create: {
        unit: '301',
        ownerName: 'Robert Taylor',
        area: 85,
        floor: 3,
        moveInDate: new Date('2025-08-20'),
        phone: '0956789012',
        email: 'robert.taylor@email.com',
        status: 'active'
      }
    })
  ])
  console.log('✅ Created', households.length, 'households')

  // Create household members
  const members = await Promise.all([
    // Room 101 - 2 members
    prisma.householdMember.create({
      data: {
        name: 'Doctor who',
        dateOfBirth: new Date('2025-12-17'),
        cccd: '34',
        householdId: households[0].id
      }
    }),
    prisma.householdMember.create({
      data: {
        name: 'Doctor 11',
        dateOfBirth: new Date('2025-12-01'),
        cccd: '123',
        householdId: households[0].id
      }
    }),
    // Room 102 - 1 member
    prisma.householdMember.create({
      data: {
        name: 'Doctor 12',
        dateOfBirth: new Date('2025-12-02'),
        cccd: '6969',
        householdId: households[1].id
      }
    }),
    // Room 103 - 1 member
    prisma.householdMember.create({
      data: {
        name: 'Lê Vũ Nguyên Hoàng',
        dateOfBirth: new Date('2005-11-12'),
        cccd: '030696969696',
        householdId: households[2].id
      }
    }),
    // Room 201 - 2 members
    prisma.householdMember.create({
      data: {
        name: 'David Wilson',
        dateOfBirth: new Date('1985-03-15'),
        cccd: '001234567890',
        householdId: households[3].id
      }
    }),
    prisma.householdMember.create({
      data: {
        name: 'Linda Wilson',
        dateOfBirth: new Date('1987-07-22'),
        cccd: '001234567891',
        householdId: households[3].id
      }
    }),
    // Room 202 - 1 member
    prisma.householdMember.create({
      data: {
        name: 'Emily Brown',
        dateOfBirth: new Date('1990-05-10'),
        cccd: '002345678901',
        householdId: households[4].id
      }
    }),
    // Room 301 - 2 members
    prisma.householdMember.create({
      data: {
        name: 'Robert Taylor',
        dateOfBirth: new Date('1982-09-08'),
        cccd: '003456789012',
        householdId: households[5].id
      }
    }),
    prisma.householdMember.create({
      data: {
        name: 'Maria Taylor',
        dateOfBirth: new Date('1984-11-25'),
        cccd: '003456789013',
        householdId: households[5].id
      }
    })
  ])
  console.log('✅ Created', members.length, 'household members')

  // Create parking slots with license plates linked to households
  const parkingSlots = await Promise.all([
    prisma.parkingSlot.upsert({
      where: { slotNumber: 'P-001' },
      update: {},
      create: {
        slotNumber: 'P-001',
        type: 'car',
        licensePlate: '51A-123.45',
        monthlyFee: 120,
        status: 'occupied',
        householdId: households[0].id
      }
    }),
    prisma.parkingSlot.upsert({
      where: { slotNumber: 'P-002' },
      update: {},
      create: {
        slotNumber: 'P-002',
        type: 'car',
        licensePlate: '30H-789.12',
        monthlyFee: 120,
        status: 'occupied',
        householdId: households[1].id
      }
    }),
    prisma.parkingSlot.upsert({
      where: { slotNumber: 'P-003' },
      update: {},
      create: {
        slotNumber: 'P-003',
        type: 'car',
        monthlyFee: 120,
        status: 'available'
      }
    }),
    prisma.parkingSlot.upsert({
      where: { slotNumber: 'M-001' },
      update: {},
      create: {
        slotNumber: 'M-001',
        type: 'motorcycle',
        licensePlate: '59-X1-456.78',
        monthlyFee: 25,
        status: 'occupied',
        householdId: households[2].id
      }
    }),
    prisma.parkingSlot.upsert({
      where: { slotNumber: 'M-002' },
      update: {},
      create: {
        slotNumber: 'M-002',
        type: 'motorcycle',
        licensePlate: '59-Y2-111.22',
        monthlyFee: 25,
        status: 'occupied',
        householdId: households[3].id
      }
    }),
    prisma.parkingSlot.upsert({
      where: { slotNumber: 'M-003' },
      update: {},
      create: {
        slotNumber: 'M-003',
        type: 'motorcycle',
        monthlyFee: 25,
        status: 'available'
      }
    }),
    prisma.parkingSlot.upsert({
      where: { slotNumber: 'B-001' },
      update: {},
      create: {
        slotNumber: 'B-001',
        type: 'bicycle',
        monthlyFee: 10,
        status: 'occupied',
        householdId: households[4].id
      }
    })
  ])
  console.log('✅ Created', parkingSlots.length, 'parking slots')

  // Create sample payments and track balances
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Track balance for each household
  const householdBalances: { [key: string]: number } = {}
  households.forEach(h => { householdBalances[h.id] = 0 })

  const paymentsData: any[] = []
  
  // Create payments for ALL households
  for (const household of households) {
    // This month's management fee - randomly collected or pending
    const isPaid = Math.random() > 0.4
    paymentsData.push({
      householdId: household.id,
      feeCategoryId: categories[0].id,
      amount: categories[0].amount,
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      status: isPaid ? 'collected' : 'pending',
      paymentDate: isPaid ? new Date() : null,
      paymentMethod: isPaid ? 'bank_transfer' : null
    })
    if (!isPaid) {
      householdBalances[household.id] += categories[0].amount
    }
    
    // Last month's service fee - all collected
    paymentsData.push({
      householdId: household.id,
      feeCategoryId: categories[1].id,
      amount: categories[1].amount,
      dueDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0),
      status: 'collected',
      paymentDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15),
      paymentMethod: 'cash'
    })

    // Add some overdue payments for a few households (overdue management fee)
    if (household.unit === 'B-201' || household.unit === 'B-202') {
      paymentsData.push({
        householdId: household.id,
        feeCategoryId: categories[0].id, // Management Fee
        amount: categories[0].amount,
        dueDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15),
        status: 'overdue',
        paymentDate: null
      })
      householdBalances[household.id] += categories[0].amount
    }
  }
  
  // Create all payments
  await Promise.all(paymentsData.map(data => prisma.payment.create({ data })))
  console.log('✅ Created', paymentsData.length, 'payment records')

  // Update household balances
  await Promise.all(
    Object.entries(householdBalances).map(([id, balance]) =>
      prisma.household.update({
        where: { id },
        data: { balance }
      })
    )
  )
  console.log('✅ Updated household balances')

  // Create sample utility bills
  const utilityBills = await Promise.all([
    prisma.utilityBill.create({
      data: {
        householdId: households[0].id,
        type: 'electricity',
        amount: 85,
        periodStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        periodEnd: new Date(now.getFullYear(), now.getMonth(), 0),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
        status: 'paid',
        paidDate: new Date()
      }
    }),
    prisma.utilityBill.create({
      data: {
        householdId: households[0].id,
        type: 'water',
        amount: 35,
        periodStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        periodEnd: new Date(now.getFullYear(), now.getMonth(), 0),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
        status: 'pending'
      }
    }),
    prisma.utilityBill.create({
      data: {
        householdId: households[1].id,
        type: 'electricity',
        amount: 65,
        periodStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        periodEnd: new Date(now.getFullYear(), now.getMonth(), 0),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
        status: 'pending'
      }
    }),
    prisma.utilityBill.create({
      data: {
        householdId: households[2].id,
        type: 'internet',
        amount: 45,
        periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
        periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
        status: 'pending'
      }
    })
  ])
  console.log('✅ Created', utilityBills.length, 'utility bills')

  // Create default settings
  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: 'apartment_name' },
      update: {},
      create: { key: 'apartment_name', value: 'BlueMoon Apartment' }
    }),
    prisma.setting.upsert({
      where: { key: 'apartment_address' },
      update: {},
      create: { key: 'apartment_address', value: '123 Main Street, District 1, Ho Chi Minh City' }
    }),
    prisma.setting.upsert({
      where: { key: 'apartment_phone' },
      update: {},
      create: { key: 'apartment_phone', value: '028 1234 5678' }
    }),
    prisma.setting.upsert({
      where: { key: 'apartment_email' },
      update: {},
      create: { key: 'apartment_email', value: 'contact@bluemoon.com' }
    })
  ])
  console.log('✅ Created', settings.length, 'settings')

  console.log('')
  console.log('🎉 Database seeding completed!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   Username: admin')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
