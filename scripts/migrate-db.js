const { PrismaClient } = require('@prisma/client');

async function main() {
  const oldUrl = process.env.OLD_DB_URL;
  const newUrl = process.env.NEW_DB_URL;

  console.log("Connecting to databases...");
  const oldDb = new PrismaClient({ datasources: { db: { url: oldUrl } } });
  const newDb = new PrismaClient({ datasources: { db: { url: newUrl } } });

  // Tables without dependencies
  const level1 = [
    'themeConfig', 'user', 'mediaAsset', 'branch', 'governorate', 
    'paymentMethod', 'coupon', 'pageVisit', 'backup', 'article', 
    'notificationCampaign', 'department', 'brand', 'collection', 'widget'
  ];

  for (const table of level1) {
    console.log(`Copying ${table}...`);
    const rows = await oldDb[table].findMany();
    if (rows.length > 0) {
      await newDb[table].createMany({ data: rows, skipDuplicates: true });
      console.log(`Copied ${rows.length} rows to ${table}.`);
    }
  }

  // Level 2 (depends on Level 1)
  const level2 = [
    'city', // depends on governorate
    'widgetContentItem', // depends on widget
    'address', // depends on user
    'activityLog', // depends on user
    'pushSubscription', // depends on user
    'notification', // depends on user
    'menu', // Independent but let's put here
    'order', // depends on user
  ];

  for (const table of level2) {
    console.log(`Copying ${table}...`);
    const rows = await oldDb[table].findMany();
    if (rows.length > 0) {
      await newDb[table].createMany({ data: rows, skipDuplicates: true });
      console.log(`Copied ${rows.length} rows to ${table}.`);
    }
  }

  // Self-referencing tables: Category
  console.log("Copying category...");
  const allCategories = await oldDb.category.findMany();
  if (allCategories.length > 0) {
    const parentCats = allCategories.filter(c => !c.parentId);
    const childCats = allCategories.filter(c => c.parentId);
    if (parentCats.length > 0) await newDb.category.createMany({ data: parentCats, skipDuplicates: true });
    if (childCats.length > 0) await newDb.category.createMany({ data: childCats, skipDuplicates: true });
    console.log(`Copied ${allCategories.length} categories.`);
  }

  // Self-referencing tables: MenuItem
  console.log("Copying menuItem...");
  const allMenuItems = await oldDb.menuItem.findMany();
  if (allMenuItems.length > 0) {
    const parentItems = allMenuItems.filter(c => !c.parentId);
    const childItems = allMenuItems.filter(c => c.parentId);
    if (parentItems.length > 0) await newDb.menuItem.createMany({ data: parentItems, skipDuplicates: true });
    if (childItems.length > 0) await newDb.menuItem.createMany({ data: childItems, skipDuplicates: true });
    console.log(`Copied ${allMenuItems.length} menu items.`);
  }

  // Level 3
  console.log("Copying product...");
  const products = await oldDb.product.findMany();
  if (products.length > 0) {
    await newDb.product.createMany({ data: products, skipDuplicates: true });
    console.log(`Copied ${products.length} products.`);
  }

  // Level 4 (depends on Product)
  const level4 = [
    'productImage',
    'productView',
    'orderItem'
  ];

  for (const table of level4) {
    console.log(`Copying ${table}...`);
    const rows = await oldDb[table].findMany();
    if (rows.length > 0) {
      await newDb[table].createMany({ data: rows, skipDuplicates: true });
      console.log(`Copied ${rows.length} rows to ${table}.`);
    }
  }

  // Implicit M:M _CollectionProducts
  console.log("Copying _CollectionProducts relation...");
  try {
    const collectionProducts = await oldDb.$queryRawUnsafe('SELECT * FROM "_CollectionProducts"');
    if (collectionProducts && collectionProducts.length > 0) {
      for (const row of collectionProducts) {
        await newDb.$executeRawUnsafe('INSERT INTO "_CollectionProducts" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING', row.A, row.B);
      }
      console.log(`Copied ${collectionProducts.length} implicit many-to-many relationships.`);
    }
  } catch (e) {
    console.log("No _CollectionProducts to copy or table does not exist.");
  }

  console.log("Migration completed successfully!");
}

main().catch(console.error).finally(async () => {
  process.exit(0);
});
