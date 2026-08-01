const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assal.com' },
    update: {},
    create: {
      email: 'admin@assal.com',
      name: 'Admin',
      passwordHash: 'admin123', // Raw password since we mocked bcrypt for now
      role: 'ADMIN',
    },
  })
  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
