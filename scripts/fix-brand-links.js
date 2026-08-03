require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBrandLinks() {
  const items = await prisma.widgetContentItem.findMany({
    where: {
      buttonUrl: { startsWith: '/products?brand=' }
    }
  });

  for (const item of items) {
    const slug = item.buttonUrl.split('=')[1];
    await prisma.widgetContentItem.update({
      where: { id: item.id },
      data: { buttonUrl: `/brand/${slug}` }
    });
  }

  console.log(`Updated ${items.length} items`);
}

fixBrandLinks().catch(console.error).finally(() => prisma.$disconnect());
