import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function populateSlugs() {
  console.log('Fetching politicians without slugs...')

  const politicians = await prisma.politician.findMany({
    where: { slug: null },
    select: { id: true, name: true, state: true }
  })

  console.log(`Found ${politicians.length} politicians without slugs`)

  // Track used slugs to handle duplicates
  const existingSlugs = new Set<string>()

  // Get existing slugs from DB
  const withSlugs = await prisma.politician.findMany({
    where: { slug: { not: null } },
    select: { slug: true }
  })
  withSlugs.forEach(p => {
    if (p.slug) existingSlugs.add(p.slug)
  })

  for (const politician of politicians) {
    let slug = generateSlug(politician.name)

    // Check if slug already exists
    if (existingSlugs.has(slug)) {
      // Add state suffix
      slug = `${slug}-${politician.state.toLowerCase()}`
    }

    // If still exists (same name, same state), add number
    let counter = 2
    let finalSlug = slug
    while (existingSlugs.has(finalSlug)) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    existingSlugs.add(finalSlug)

    await prisma.politician.update({
      where: { id: politician.id },
      data: { slug: finalSlug }
    })

    console.log(`Updated: ${politician.name} -> ${finalSlug}`)
  }

  console.log('Done!')
}

populateSlugs()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
