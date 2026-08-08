const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  await prisma.article.create({
    data: {
      title: 'Test Video Article',
      slug: 'test-video-article',
      content: '<p>Here is a video:</p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe><p>And a link:</p><a href="https://youtube.com">YouTube</a>',
      isActive: true
    }
  });
  console.log("Created test article");
}
test().catch(console.error).finally(() => prisma['$disconnect']());
