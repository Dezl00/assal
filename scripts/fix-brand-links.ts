import { db } from "../src/lib/db";

async function fixBrandLinks() {
  const items = await db.widgetContentItem.findMany({
    where: {
      buttonUrl: { startsWith: '/products?brand=' }
    }
  });

  for (const item of items) {
    const slug = item.buttonUrl?.split('=')[1];
    if (slug) {
      await db.widgetContentItem.update({
        where: { id: item.id },
        data: { buttonUrl: `/brand/${slug}` }
      });
    }
  }

  console.log(`Updated ${items.length} items`);
}

fixBrandLinks().catch(console.error).finally(() => process.exit(0));
