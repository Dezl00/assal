const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function find() {
  const articles = await prisma.article.findMany();
  for (const a of articles) {
    if (a.content.includes('grFQygwA27k')) {
      console.log('FOUND ARTICLE:', a.id);
      const match = a.content.match(/<[^>]*grFQygwA27k[^>]*>/i);
      console.log('MATCH:', match ? match[0] : 'None');
    }
  }
}
find().catch(console.error).finally(() => prisma['$disconnect']());
