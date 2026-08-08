const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const article = await prisma.article.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  
  if (article) {
    fs.writeFileSync('article_content_dump.txt', article.content);
    console.log("Content written to article_content_dump.txt");
  } else {
    console.log("No articles found");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
