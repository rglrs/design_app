import { prisma } from '../lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword,
    },
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })
}

main()
  .catch(() => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })