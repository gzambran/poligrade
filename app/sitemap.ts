import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://poligrade.com'

  // Fetch all published politicians with slugs
  const politicians = await prisma.politician.findMany({
    where: {
      published: true,
      slug: { not: null }
    },
    select: {
      slug: true,
      updatedAt: true
    }
  })

  const politicianUrls: MetadataRoute.Sitemap = politicians.map((p) => ({
    url: `${baseUrl}/politicians/${p.slug}`,
    lastModified: p.updatedAt,
  }))

  return [
    { url: baseUrl },
    { url: `${baseUrl}/quiz` },
    { url: `${baseUrl}/grades` },
    { url: `${baseUrl}/faq` },
    { url: `${baseUrl}/contact` },
    { url: `${baseUrl}/donate` },
    { url: `${baseUrl}/privacy` },
    ...politicianUrls,
  ]
}
