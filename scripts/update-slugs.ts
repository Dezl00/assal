import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' }
  })
  
  let currentId = 1
  let updatedCount = 0
  
  for (const p of products) {
    if (p.slug.startsWith('product-') || p.slug.length > 5) {
      // Find lowest available ID starting from currentId
      let nextId = currentId
      while (true) {
        const exists = await prisma.product.findUnique({ where: { slug: nextId.toString() } })
        if (!exists) break
        nextId++
      }
      
      console.log(`Updating ${p.name} from ${p.slug} to ${nextId}`)
      await prisma.product.update({
        where: { id: p.id },
        data: { slug: nextId.toString() }
      })
      
      currentId = nextId + 1
      updatedCount++
    }
  }
  
  console.log(`Done! Updated ${updatedCount} products.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
