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
  await prisma.temporaryAbsence.deleteMany()
  await prisma.temporaryResidence.deleteMany()
  // First set ownerId to null before deleting members
  await prisma.household.updateMany({ data: { ownerId: null } })
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

  // Create sample households (without owners first, owners will be linked after creating members)
  const householdsData = [
    { unit: '101', area: 70, floor: 1, moveInDate: new Date('2025-01-15'), phone: '0901234567', email: 'unit101@bluemoon.com' },
    { unit: '102', area: 65, floor: 1, moveInDate: new Date('2025-02-01'), phone: '0912345678', email: 'unit102@bluemoon.com' },
    { unit: '103', area: 75, floor: 1, moveInDate: new Date('2024-11-12'), phone: '0923456789', email: 'unit103@bluemoon.com' },
    { unit: '201', area: 80, floor: 2, moveInDate: new Date('2024-10-15'), phone: '0934567890', email: 'unit201@bluemoon.com' },
    { unit: '202', area: 70, floor: 2, moveInDate: new Date('2024-09-01'), phone: '0945678901', email: 'unit202@bluemoon.com' },
    { unit: '203', area: 72, floor: 2, moveInDate: new Date('2024-08-20'), phone: '0956789012', email: 'unit203@bluemoon.com' },
    { unit: '301', area: 85, floor: 3, moveInDate: new Date('2024-07-10'), phone: '0967890123', email: 'unit301@bluemoon.com' },
    { unit: '302', area: 90, floor: 3, moveInDate: new Date('2024-06-05'), phone: '0978901234', email: 'unit302@bluemoon.com' },
    { unit: '303', area: 78, floor: 3, moveInDate: new Date('2024-05-20'), phone: '0989012345', email: 'unit303@bluemoon.com' },
    { unit: '401', area: 95, floor: 4, moveInDate: new Date('2024-04-15'), phone: '0990123456', email: 'unit401@bluemoon.com' },
    { unit: '402', area: 88, floor: 4, moveInDate: new Date('2024-03-01'), phone: '0901234568', email: 'unit402@bluemoon.com' },
    { unit: '403', area: 82, floor: 4, moveInDate: new Date('2024-02-10'), phone: '0912345679', email: 'unit403@bluemoon.com' },
    { unit: '501', area: 100, floor: 5, moveInDate: new Date('2024-01-05'), phone: '0923456780', email: 'unit501@bluemoon.com' },
    { unit: '502', area: 92, floor: 5, moveInDate: new Date('2023-12-15'), phone: '0934567891', email: 'unit502@bluemoon.com' },
    { unit: '503', area: 85, floor: 5, moveInDate: new Date('2023-11-20'), phone: '0945678902', email: 'unit503@bluemoon.com' },
  ]

  const households = await Promise.all(
    householdsData.map(data =>
      prisma.household.upsert({
        where: { unit: data.unit },
        update: {},
        create: { ...data, status: 'active' }
      })
    )
  )
  console.log('✅ Created', households.length, 'households')

  // Owner and member data for each household (removed gender and phone as they're not in the schema)
  const membersData = [
    // Unit 101 - 3 members
    { householdIndex: 0, name: 'Nguyễn Văn An', dob: '1985-03-15', cccd: '001085012345', isOwner: true },
    { householdIndex: 0, name: 'Trần Thị Bình', dob: '1988-07-22', cccd: '001088012346', relation: 'spouse' },
    { householdIndex: 0, name: 'Nguyễn Văn Cường', dob: '2010-05-10', cccd: '001110012347', relation: 'child' },
    
    // Unit 102 - 2 members
    { householdIndex: 1, name: 'Lê Hoàng Dũng', dob: '1990-11-08', cccd: '001090012348', isOwner: true },
    { householdIndex: 1, name: 'Phạm Thị Hương', dob: '1992-04-18', cccd: '001092012349', relation: 'spouse' },
    
    // Unit 103 - 4 members
    { householdIndex: 2, name: 'Hoàng Minh Tuấn', dob: '1978-09-25', cccd: '001078012350', isOwner: true },
    { householdIndex: 2, name: 'Vũ Thị Lan', dob: '1980-12-03', cccd: '001080012351', relation: 'spouse' },
    { householdIndex: 2, name: 'Hoàng Minh Khoa', dob: '2005-06-15', cccd: '001105012352', relation: 'child' },
    { householdIndex: 2, name: 'Hoàng Thị Mai', dob: '2008-02-28', cccd: '001108012353', relation: 'child' },
    
    // Unit 201 - 2 members
    { householdIndex: 3, name: 'David Wilson', dob: '1982-01-20', cccd: '001082012354', isOwner: true },
    { householdIndex: 3, name: 'Sarah Wilson', dob: '1985-08-14', cccd: '001085012355', relation: 'spouse' },
    
    // Unit 202 - 1 member (single owner)
    { householdIndex: 4, name: 'Emily Brown', dob: '1995-05-10', cccd: '001095012356', isOwner: true },
    
    // Unit 203 - 3 members
    { householdIndex: 5, name: 'Trần Đức Thắng', dob: '1975-04-05', cccd: '001075012357', isOwner: true },
    { householdIndex: 5, name: 'Nguyễn Thị Hoa', dob: '1978-10-22', cccd: '001078012358', relation: 'spouse' },
    { householdIndex: 5, name: 'Trần Thị Ngọc', dob: '2000-07-30', cccd: '001100012359', relation: 'child' },
    
    // Unit 301 - 5 members (large family)
    { householdIndex: 6, name: 'Phạm Văn Hùng', dob: '1970-02-14', cccd: '001070012360', isOwner: true },
    { householdIndex: 6, name: 'Lê Thị Kim', dob: '1972-06-28', cccd: '001072012361', relation: 'spouse' },
    { householdIndex: 6, name: 'Phạm Văn Long', dob: '1995-09-12', cccd: '001095012362', relation: 'child' },
    { householdIndex: 6, name: 'Phạm Thị Linh', dob: '1998-03-08', cccd: '001098012363', relation: 'child' },
    { householdIndex: 6, name: 'Nguyễn Thị Bà', dob: '1945-11-20', cccd: '001045012364', relation: 'parent' },
    
    // Unit 302 - 2 members
    { householdIndex: 7, name: 'Robert Taylor', dob: '1988-12-05', cccd: '001088012365', isOwner: true },
    { householdIndex: 7, name: 'Maria Taylor', dob: '1990-04-15', cccd: '001090012366', relation: 'spouse' },
    
    // Unit 303 - 3 members
    { householdIndex: 8, name: 'Võ Minh Quang', dob: '1983-07-18', cccd: '001083012367', isOwner: true },
    { householdIndex: 8, name: 'Đặng Thị Thu', dob: '1986-01-25', cccd: '001086012368', relation: 'spouse' },
    { householdIndex: 8, name: 'Võ Minh Đức', dob: '2015-10-03', cccd: '001115012369', relation: 'child' },
    
    // Unit 401 - 2 members
    { householdIndex: 9, name: 'Nguyễn Thanh Sơn', dob: '1980-08-30', cccd: '001080012370', isOwner: true },
    { householdIndex: 9, name: 'Bùi Thị Hằng', dob: '1982-12-12', cccd: '001082012371', relation: 'spouse' },
    
    // Unit 402 - 4 members
    { householdIndex: 10, name: 'Đỗ Văn Mạnh', dob: '1976-05-22', cccd: '001076012372', isOwner: true },
    { householdIndex: 10, name: 'Trịnh Thị Nga', dob: '1979-09-08', cccd: '001079012373', relation: 'spouse' },
    { householdIndex: 10, name: 'Đỗ Văn Tùng', dob: '2002-04-16', cccd: '001102012374', relation: 'child' },
    { householdIndex: 10, name: 'Đỗ Thị Trang', dob: '2006-08-24', cccd: '001106012375', relation: 'child' },
    
    // Unit 403 - 1 member (single owner)
    { householdIndex: 11, name: 'James Anderson', dob: '1992-03-10', cccd: '001092012376', isOwner: true },
    
    // Unit 501 - 3 members (penthouse)
    { householdIndex: 12, name: 'Lý Quang Vinh', dob: '1968-11-28', cccd: '001068012377', isOwner: true },
    { householdIndex: 12, name: 'Huỳnh Thị Phượng', dob: '1970-05-16', cccd: '001070012378', relation: 'spouse' },
    { householdIndex: 12, name: 'Lý Hoàng Nam', dob: '1993-02-20', cccd: '001093012379', relation: 'child' },
    
    // Unit 502 - 2 members
    { householdIndex: 13, name: 'Michael Chen', dob: '1985-06-12', cccd: '001085012380', isOwner: true },
    { householdIndex: 13, name: 'Lisa Chen', dob: '1987-10-05', cccd: '001087012381', relation: 'spouse' },
    
    // Unit 503 - 2 members + 1 temporary resident
    { householdIndex: 14, name: 'Phan Văn Đức', dob: '1979-04-08', cccd: '001079012382', isOwner: true },
    { householdIndex: 14, name: 'Lương Thị Mai', dob: '1981-08-19', cccd: '001081012383', relation: 'spouse' },
    { householdIndex: 14, name: 'Trương Văn Tâm', dob: '1990-12-01', cccd: '001090012384', relation: 'other', residenceType: 'temporary' },
  ]

  // Create members and track owners
  const ownerIds: { [householdId: string]: string } = {}
  
  for (const memberData of membersData) {
    const household = households[memberData.householdIndex]
    const member = await prisma.householdMember.create({
      data: {
        name: memberData.name,
        dateOfBirth: new Date(memberData.dob),
        cccd: memberData.cccd,
        householdId: household.id,
        residenceType: memberData.residenceType || 'permanent',
        relationToOwner: memberData.isOwner ? 'self' : (memberData.relation || 'other'),
        status: 'living',
        moveInDate: household.moveInDate
      }
    })
    
    if (memberData.isOwner) {
      ownerIds[household.id] = member.id
    }
  }
  
  console.log('✅ Created', membersData.length, 'household members')

  // Link owners to households
  await Promise.all(
    Object.entries(ownerIds).map(([householdId, ownerId]) =>
      prisma.household.update({
        where: { id: householdId },
        data: { ownerId }
      })
    )
  )
  console.log('✅ Linked', Object.keys(ownerIds).length, 'owners to households')

  // Create parking slots with license plates linked to households
  // Pricing: Car = $20/month, Motorcycle = $5/month, Bicycle = $0 (Free)
  const parkingSlots = await Promise.all([
    // Car slots ($20/month)
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-001' }, update: {}, create: { slotNumber: 'A-001', type: 'car', licensePlate: '51A-123.45', monthlyFee: 20, status: 'occupied', householdId: households[0].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-002' }, update: {}, create: { slotNumber: 'A-002', type: 'car', licensePlate: '30H-789.12', monthlyFee: 20, status: 'occupied', householdId: households[1].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-003' }, update: {}, create: { slotNumber: 'A-003', type: 'car', licensePlate: '51G-456.78', monthlyFee: 20, status: 'occupied', householdId: households[3].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-004' }, update: {}, create: { slotNumber: 'A-004', type: 'car', licensePlate: '51K-222.33', monthlyFee: 20, status: 'occupied', householdId: households[6].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-005' }, update: {}, create: { slotNumber: 'A-005', type: 'car', licensePlate: '30E-111.44', monthlyFee: 20, status: 'occupied', householdId: households[9].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-006' }, update: {}, create: { slotNumber: 'A-006', type: 'car', licensePlate: '51F-888.99', monthlyFee: 20, status: 'occupied', householdId: households[12].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-007' }, update: {}, create: { slotNumber: 'A-007', type: 'car', monthlyFee: 20, status: 'available' } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-008' }, update: {}, create: { slotNumber: 'A-008', type: 'car', monthlyFee: 20, status: 'available' } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-009' }, update: {}, create: { slotNumber: 'A-009', type: 'car', monthlyFee: 20, status: 'maintenance' } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'A-010' }, update: {}, create: { slotNumber: 'A-010', type: 'car', monthlyFee: 20, status: 'available' } }),
    
    // Motorcycle slots ($5/month)
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-001' }, update: {}, create: { slotNumber: 'B-001', type: 'motorcycle', licensePlate: '59-X1-456.78', monthlyFee: 5, status: 'occupied', householdId: households[2].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-002' }, update: {}, create: { slotNumber: 'B-002', type: 'motorcycle', licensePlate: '59-Y2-111.22', monthlyFee: 5, status: 'occupied', householdId: households[4].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-003' }, update: {}, create: { slotNumber: 'B-003', type: 'motorcycle', licensePlate: '59-Z3-333.44', monthlyFee: 5, status: 'occupied', householdId: households[5].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-004' }, update: {}, create: { slotNumber: 'B-004', type: 'motorcycle', licensePlate: '59-A4-555.66', monthlyFee: 5, status: 'occupied', householdId: households[7].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-005' }, update: {}, create: { slotNumber: 'B-005', type: 'motorcycle', licensePlate: '59-B5-777.88', monthlyFee: 5, status: 'occupied', householdId: households[8].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-006' }, update: {}, create: { slotNumber: 'B-006', type: 'motorcycle', licensePlate: '59-C6-999.00', monthlyFee: 5, status: 'occupied', householdId: households[10].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-007' }, update: {}, create: { slotNumber: 'B-007', type: 'motorcycle', licensePlate: '59-D7-123.45', monthlyFee: 5, status: 'occupied', householdId: households[11].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-008' }, update: {}, create: { slotNumber: 'B-008', type: 'motorcycle', licensePlate: '59-E8-678.90', monthlyFee: 5, status: 'occupied', householdId: households[13].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-009' }, update: {}, create: { slotNumber: 'B-009', type: 'motorcycle', licensePlate: '59-F9-246.80', monthlyFee: 5, status: 'occupied', householdId: households[14].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-010' }, update: {}, create: { slotNumber: 'B-010', type: 'motorcycle', monthlyFee: 5, status: 'available' } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-011' }, update: {}, create: { slotNumber: 'B-011', type: 'motorcycle', monthlyFee: 5, status: 'available' } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'B-012' }, update: {}, create: { slotNumber: 'B-012', type: 'motorcycle', monthlyFee: 5, status: 'available' } }),
    
    // Bicycle slots (Free - $0/month)
    prisma.parkingSlot.upsert({ where: { slotNumber: 'C-001' }, update: {}, create: { slotNumber: 'C-001', type: 'bicycle', monthlyFee: 0, status: 'occupied', householdId: households[0].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'C-002' }, update: {}, create: { slotNumber: 'C-002', type: 'bicycle', monthlyFee: 0, status: 'occupied', householdId: households[2].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'C-003' }, update: {}, create: { slotNumber: 'C-003', type: 'bicycle', monthlyFee: 0, status: 'occupied', householdId: households[5].id } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'C-004' }, update: {}, create: { slotNumber: 'C-004', type: 'bicycle', monthlyFee: 0, status: 'available' } }),
    prisma.parkingSlot.upsert({ where: { slotNumber: 'C-005' }, update: {}, create: { slotNumber: 'C-005', type: 'bicycle', monthlyFee: 0, status: 'available' } }),
  ])
  console.log('✅ Created', parkingSlots.length, 'parking slots')

  // Create sample payments for 2024 and 2025 (full 2 years)
  const householdBalances: { [key: string]: number } = {}
  households.forEach(h => { householdBalances[h.id] = 0 })

  const paymentsData: any[] = []
  
  // Generate payments for each month from January 2024 to December 2025
  const years = [2024, 2025]
  const currentDate = new Date(2025, 11, 26) // December 26, 2025
  
  for (const year of years) {
    for (let month = 0; month < 12; month++) {
      const dueDate = new Date(year, month + 1, 0) // Last day of month
      const isPastMonth = new Date(year, month, 1) < currentDate
      const isCurrentMonth = year === 2025 && month === 11 // December 2025
      
      for (let i = 0; i < households.length; i++) {
        const household = households[i]
        
        // Management Fee - monthly
        const mgmtCollectionRate = isPastMonth ? 0.92 : (isCurrentMonth ? 0.65 : 0.85)
        const isMgmtPaid = Math.random() < mgmtCollectionRate
        const mgmtStatus = isMgmtPaid ? 'collected' : (isPastMonth && !isCurrentMonth ? 'overdue' : 'pending')
        
        paymentsData.push({
          householdId: household.id,
          feeCategoryId: categories[0].id, // Management Fee
          amount: categories[0].amount,
          dueDate,
          status: mgmtStatus,
          paymentDate: isMgmtPaid ? new Date(year, month, 5 + Math.floor(Math.random() * 20)) : null,
          paymentMethod: isMgmtPaid ? (Math.random() > 0.5 ? 'bank_transfer' : 'cash') : null
        })
        
        if (mgmtStatus !== 'collected') {
          householdBalances[household.id] += categories[0].amount
        }
        
        // Service Fee - monthly
        const svcCollectionRate = isPastMonth ? 0.95 : (isCurrentMonth ? 0.70 : 0.88)
        const isSvcPaid = Math.random() < svcCollectionRate
        const svcStatus = isSvcPaid ? 'collected' : (isPastMonth && !isCurrentMonth ? 'overdue' : 'pending')
        
        paymentsData.push({
          householdId: household.id,
          feeCategoryId: categories[1].id, // Service Fee
          amount: categories[1].amount,
          dueDate,
          status: svcStatus,
          paymentDate: isSvcPaid ? new Date(year, month, 3 + Math.floor(Math.random() * 22)) : null,
          paymentMethod: isSvcPaid ? (Math.random() > 0.6 ? 'cash' : 'bank_transfer') : null
        })
        
        if (svcStatus !== 'collected') {
          householdBalances[household.id] += categories[1].amount
        }
      }
    }
    
    // Annual Maintenance Fund - due at end of each year with collected date when paid
    const annualDueDate = new Date(year, 11, 31) // December 31
    const isAnnualPastDue = year < 2025 || (year === 2025 && currentDate.getMonth() === 11)
    
    for (let i = 0; i < households.length; i++) {
      const household = households[i]
      const annualCollectionRate = year === 2024 ? 0.88 : 0.72
      const isAnnualPaid = Math.random() < annualCollectionRate
      const annualStatus = isAnnualPaid ? 'collected' : (year === 2024 ? 'overdue' : 'pending')
      
      // Collected date is typically in November or December of that year
      const collectedMonth = Math.random() > 0.5 ? 10 : 11 // November or December
      const collectedDay = 5 + Math.floor(Math.random() * 20)
      
      paymentsData.push({
        householdId: household.id,
        feeCategoryId: categories[2].id, // Maintenance Fund
        amount: categories[2].amount,
        dueDate: annualDueDate,
        status: annualStatus,
        paymentDate: isAnnualPaid ? new Date(year, collectedMonth, collectedDay) : null,
        paymentMethod: isAnnualPaid ? 'bank_transfer' : null,
        notes: !isAnnualPaid && year === 2024 ? 'Overdue - multiple reminders sent' : null
      })
      
      if (annualStatus !== 'collected') {
        householdBalances[household.id] += categories[2].amount
      }
    }
  }
  
  // Create all payments in batches to avoid connection pool timeout
  const batchSize = 50
  for (let i = 0; i < paymentsData.length; i += batchSize) {
    const batch = paymentsData.slice(i, i + batchSize)
    await Promise.all(batch.map(data => prisma.payment.create({ data })))
  }
  console.log('✅ Created', paymentsData.length, 'payment records (2024-2025)')

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

  // Create utility bills for 2024 and 2025 (full 2 years)
  const utilityBillsData: any[] = []
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  
  for (const year of [2024, 2025]) {
    for (let month = 0; month < 12; month++) {
      const monthLabel = `${monthNames[month]} ${year}`
      const isPastMonth = new Date(year, month, 1) < new Date(2025, 11, 1) // Before Dec 2025
      const isCurrentMonth = year === 2025 && month === 11 // December 2025
      
      for (const household of households) {
        // Vary electricity based on season (higher in summer months)
        const isSummer = month >= 4 && month <= 8
        const baseElec = isSummer ? 220 : 150
        const elecUsage = baseElec + Math.floor(Math.random() * 150)
        const elecRate = 0.35
        
        // Water usage varies slightly
        const waterUsage = 8 + Math.floor(Math.random() * 18)
        const waterRate = 2.5
        
        const elecCost = Math.round(elecUsage * elecRate)
        const waterCost = Math.round(waterUsage * waterRate)
        const internetCost = 30
        const totalAmount = elecCost + waterCost + internetCost
        
        // Determine status - past months are mostly paid
        const collectionRate = isPastMonth ? 0.95 : (isCurrentMonth ? 0.55 : 0.85)
        const isPaid = Math.random() < collectionRate
        const status = isPaid ? 'paid' : (isPastMonth && !isCurrentMonth ? 'overdue' : 'pending')
        
        utilityBillsData.push({
          householdId: household.id,
          month: monthLabel,
          electricityUsage: elecUsage,
          electricityCost: elecCost,
          waterUsage: waterUsage,
          waterCost: waterCost,
          internetCost: internetCost,
          totalAmount: totalAmount,
          periodStart: new Date(year, month, 1),
          periodEnd: new Date(year, month + 1, 0), // Last day of month
          dueDate: new Date(year, month + 1, 15), // 15th of next month
          status: status,
          paidDate: isPaid ? new Date(year, month + 1, 5 + Math.floor(Math.random() * 10)) : null
        })
      }
    }
  }
  
  // Create utility bills in batches to avoid connection pool timeout
  for (let i = 0; i < utilityBillsData.length; i += batchSize) {
    const batch = utilityBillsData.slice(i, i + batchSize)
    await Promise.all(batch.map(data => prisma.utilityBill.create({ data })))
  }
  console.log('✅ Created', utilityBillsData.length, 'utility bills (2024-2025)')

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
