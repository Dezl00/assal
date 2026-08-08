const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.article.findFirst({ orderBy: { createdAt: 'desc' } })
  .then(a => console.log(a.content))
  .finally(() => prisma.$disconnect());
