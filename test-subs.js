require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subs = await prisma.pushSubscription.findMany();
  console.log("Subscriptions:", subs);
}
main().finally(() => prisma.$disconnect());
