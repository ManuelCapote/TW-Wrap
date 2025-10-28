// Seed script to populate the database with demo data
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Demo password: 'demo123' (we'll hash it)
  const hashedPassword = await bcrypt.hash('demo123', 12)

  // STEP 1: Create a demo family
  console.log('Creating demo family...')
  const demoFamily = await prisma.family.create({
    data: {
      name: 'Demo Family'
    }
  })
  console.log(`✅ Created family: ${demoFamily.name}`)

  // STEP 2: Create demo users
  console.log('Creating demo users...')

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@family.com',
      password: hashedPassword,
      avatar: '👨‍💻',
      familyId: demoFamily.id
    }
  })
  console.log(`✅ Created user: ${demoUser.name} (${demoUser.email})`)

  const momUser = await prisma.user.create({
    data: {
      name: 'Mom',
      email: 'mom@family.com',
      password: hashedPassword,
      avatar: '👩‍🦳',
      familyId: demoFamily.id
    }
  })
  console.log(`✅ Created user: ${momUser.name} (${momUser.email})`)

  const dadUser = await prisma.user.create({
    data: {
      name: 'Dad',
      email: 'dad@family.com',
      password: hashedPassword,
      avatar: '👨‍🦲',
      familyId: demoFamily.id
    }
  })
  console.log(`✅ Created user: ${dadUser.name} (${dadUser.email})`)

  // STEP 3: Create demo wishlist items
  console.log('Creating wishlist items...')

  // Demo User's items
  await prisma.wishlistItem.create({
    data: {
      title: 'Sony WH-1000XM5 Headphones',
      description: 'Wireless noise-canceling headphones',
      url: 'https://amazon.com/sony-wh1000xm5',
      price: 349.99,
      currency: 'USD',
      store: 'Amazon',
      quantity: 1,
      isPurchased: false,
      priority: 'HIGH',
      userId: demoUser.id
    }
  })

  await prisma.wishlistItem.create({
    data: {
      title: 'Kindle Paperwhite',
      description: 'E-reader for reading books',
      url: 'https://amazon.com/kindle-paperwhite',
      price: 139.99,
      currency: 'USD',
      store: 'Amazon',
      quantity: 1,
      isPurchased: false,
      priority: 'MEDIUM',
      userId: demoUser.id
    }
  })

  // Mom's items
  await prisma.wishlistItem.create({
    data: {
      title: 'Instant Pot Duo',
      description: '7-in-1 Electric Pressure Cooker',
      url: 'https://target.com/instant-pot-duo',
      price: 89.95,
      currency: 'USD',
      store: 'Target',
      quantity: 1,
      isPurchased: false,
      priority: 'HIGH',
      userId: momUser.id
    }
  })

  // Mom's purchased item (purchased by Dad 3 days ago)
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  await prisma.wishlistItem.create({
    data: {
      title: 'Yoga Mat',
      description: 'Non-slip exercise mat',
      url: 'https://rei.com/yoga-mat',
      price: 24.99,
      currency: 'USD',
      store: 'REI',
      quantity: 1,
      isPurchased: true,
      purchasedBy: dadUser.id,
      purchasedAt: threeDaysAgo,
      priority: 'MEDIUM',
      userId: momUser.id
    }
  })

  // Dad's items
  await prisma.wishlistItem.create({
    data: {
      title: 'Mechanical Keyboard',
      description: 'Cherry MX Blue switches',
      url: 'https://bestbuy.com/mechanical-keyboard',
      price: 129.99,
      currency: 'USD',
      store: 'Best Buy',
      quantity: 1,
      isPurchased: false,
      priority: 'LOW',
      userId: dadUser.id
    }
  })

  await prisma.wishlistItem.create({
    data: {
      title: 'Standing Desk Converter',
      description: 'Adjustable height desk riser',
      url: 'https://walmart.com/standing-desk',
      price: 199.00,
      currency: 'USD',
      store: 'Walmart',
      quantity: 1,
      isPurchased: false,
      priority: 'HIGH',
      userId: dadUser.id
    }
  })

  console.log('✅ Created 6 wishlist items')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Demo Account Credentials:')
  console.log('   Email: demo@family.com')
  console.log('   Password: demo123')
  console.log('\n   Email: mom@family.com')
  console.log('   Password: demo123')
  console.log('\n   Email: dad@family.com')
  console.log('   Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
