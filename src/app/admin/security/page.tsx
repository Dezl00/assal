import { db as prisma } from '@/lib/db'
import { SecurityClient } from './security-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SecurityPage() {
  const session = await auth()
  if (!session?.user) redirect('/admin')

  const isAdmin = session?.user?.role === 'ADMIN'

  // Only admins see the logs
  const logs = isAdmin ? await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: true }
  }) : []

  return <SecurityClient logs={logs} currentUser={session.user} />
}
