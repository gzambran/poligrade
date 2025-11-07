import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing database connection...')

  // Test connection by counting politicians
  const count = await prisma.politician.count()
  console.log(`✅ Database connected successfully!`)
  console.log(`Current politician count: ${count}`)

  // Test creating a politician
  console.log('\nTesting create operation...')
  const testPolitician = await prisma.politician.create({
    data: {
      name: 'Test Politician',
      state: 'Massachusetts',
      district: null,
      office: 'GOVERNOR',
      status: 'INCUMBENT',
      grade: 'CENTRIST',
    },
  })
  console.log(`✅ Created test politician: ${testPolitician.name}`)

  // Clean up test data
  await prisma.politician.delete({
    where: { id: testPolitician.id },
  })
  console.log(`✅ Deleted test politician`)

  console.log('\n🎉 All database tests passed!')
}

main()
  .catch((e) => {
    console.error('❌ Database test failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
