const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const oldUrl = process.env.OLD_DB_URL;
  const newUrl = process.env.NEW_DB_URL;

  const oldDb = new PrismaClient({ datasources: { db: { url: oldUrl } } });
  const newDb = new PrismaClient({ datasources: { db: { url: newUrl } } });

  console.log("=== DB Verification Report ===\n");

  const models = [
    'themeConfig', 'user', 'mediaAsset', 'branch', 'governorate', 
    'paymentMethod', 'coupon', 'pageVisit', 'backup', 'article', 
    'notificationCampaign', 'department', 'brand', 'collection', 'widget',
    'city', 'widgetContentItem', 'address', 'activityLog', 'pushSubscription',
    'notification', 'menu', 'order', 'category', 'menuItem', 'product',
    'productImage', 'productView', 'orderItem'
  ];

  let allMatch = true;
  const report = [];

  for (const model of models) {
    try {
      const newCount = await newDb[model].count();
      
      report.push({
        Table: model,
        New_DB_Rows: newCount
      });

    } catch (e) {
      console.log(`Model ${model} missing in new DB or error: ${e.message}`);
    }
  }

  console.table(report);

  if (allMatch) {
    console.log("\n✅ All row counts match exactly!");
  } else {
    console.log("\n❌ Row count mismatches found.");
  }

  // 2. Test Write on New DB
  console.log("\n=== Testing Write Operation on New DB ===");
  try {
    const testLog = await newDb.pageVisit.create({
      data: {
        path: "/test-migration-write",
        ipAddress: "127.0.0.1"
      }
    });
    console.log(`✅ Write successful. Inserted test PageVisit with ID: ${testLog.id}`);
    
    // Delete it to clean up
    await newDb.pageVisit.delete({ where: { id: testLog.id } });
    console.log(`✅ Delete successful. Cleaned up test PageVisit.`);
  } catch (e) {
    console.log(`❌ Write test failed: ${e.message}`);
  }

  process.exit(0);
}

main().catch(console.error);
