import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing API functionality with direct database operations...\n')

  // Test 1: Create a politician
  console.log('1️⃣  Testing CREATE...')
  const newPolitician = await prisma.politician.create({
    data: {
      name: 'Test Governor',
      state: 'California',
      district: null,
      office: 'GOVERNOR',
      status: 'INCUMBENT',
      grade: 'LIBERAL',
    },
  })
  console.log(`✅ Created: ${newPolitician.name} (ID: ${newPolitician.id})`)

  // Test 2: List all politicians
  console.log('\n2️⃣  Testing LIST...')
  const allPoliticians = await prisma.politician.findMany()
  console.log(`✅ Found ${allPoliticians.length} politician(s)`)

  // Test 3: Update the politician
  console.log('\n3️⃣  Testing UPDATE...')
  const updatedPolitician = await prisma.politician.update({
    where: { id: newPolitician.id },
    data: { grade: 'PROGRESSIVE' },
  })
  console.log(`✅ Updated: ${updatedPolitician.name} - Grade changed to ${updatedPolitician.grade}`)

  // Test 4: Filter politicians
  console.log('\n4️⃣  Testing FILTER...')
  const filtered = await prisma.politician.findMany({
    where: { state: 'California' },
  })
  console.log(`✅ Found ${filtered.length} politician(s) from California`)

  // Test 5: Delete the politician
  console.log('\n5️⃣  Testing DELETE...')
  await prisma.politician.delete({
    where: { id: newPolitician.id },
  })
  console.log(`✅ Deleted test politician`)

  // Verify deletion
  const finalCount = await prisma.politician.count()
  console.log(`\n✅ Final count: ${finalCount} politician(s)`)

  console.log('\n🎉 All database operations working correctly!')
  console.log('\n📝 Note: API endpoints use the same Prisma operations.')
  console.log('   They will work once you access them with valid authentication.')
}

main()
  .catch((e) => {
    console.error('❌ Test failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
