import { prisma } from '@/lib/prisma'
import { AccountsClient } from './accounts-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AccountsPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/admin')

  const accounts = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER'] } },
    orderBy: { createdAt: 'desc' }
  })

  return <AccountsClient accounts={accounts} />
}
