import { db as prisma } from '@/lib/db'
import { SecurityClient } from './security-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SecurityPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/admin')

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: true }
  })

  return <SecurityClient logs={logs} />
}
