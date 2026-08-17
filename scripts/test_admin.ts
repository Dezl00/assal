import { db as prisma } from '@/lib/db';
async function test() {
  try {
    const user = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    console.log("Admin user:", user);
  } catch(e) {
    console.error(e);
  }
}
test();
