'use server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createAccount(data: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  try {
    await prisma.user.create({
      data: {
        name: data.get('name') as string,
        email: data.get('email') as string,
        role: data.get('role') as any,
      }
    })
    revalidatePath('/admin/accounts')
    return { success: true }
  } catch(e) {
    return { success: false, error: 'فشل الإنشاء (ربما البريد مستخدم)' }
  }
}

export async function updateAccount(id: string, data: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: data.get('name') as string,
        email: data.get('email') as string,
        role: data.get('role') as any,
      }
    })
    revalidatePath('/admin/accounts')
    return { success: true }
  } catch(e) {
    return { success: false, error: 'فشل التحديث' }
  }
}

export async function deleteAccount(id: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  try {
    await prisma.user.delete({ where: { id } })
    revalidatePath('/admin/accounts')
    return { success: true }
  } catch(e) {
    return { success: false, error: 'فشل الحذف' }
  }
}
