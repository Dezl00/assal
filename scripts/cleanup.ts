import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function cleanup() {
  const widgets = await db.widget.findMany({
    where: { type: 'BrandSlider' },
    include: { items: true }
  })

  for (const w of widgets) {
    const disableRouting = (w.settings as any)?.disableRouting === true
    if (disableRouting) {
      for (const item of w.items) {
        if (item.title) {
          const b = await db.brand.findFirst({ where: { name: item.title } })
          if (b) {
            console.log(`Deleting brand ${b.name}`)
            await db.product.updateMany({ where: { brandId: b.id }, data: { brandId: null } })
            await db.brand.delete({ where: { id: b.id } })
          }
        }
      }
    }
  }
}

cleanup().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
