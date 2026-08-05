'use server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createAccount(data: FormData) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const hasPerm = session?.user?.permissions?.includes('accounts.add')
  if (!isAdmin && !hasPerm) return { success: false, error: 'Unauthorized' }

  try {
    let permissions = []
    try {
      permissions = JSON.parse(data.get('permissions') as string || '[]')
    } catch (e) {}

    const passwordHash = data.get('password') as string

    await prisma.user.create({
      data: {
        name: data.get('name') as string,
        phone: data.get('phone') as string,
        role: data.get('role') as any,
        permissions: permissions,
        passwordHash: passwordHash || null,
      }
    })
    revalidatePath('/admin/accounts')
    return { success: true }
  } catch(e) {
    return { success: false, error: 'فشل الإنشاء (ربما الهاتف مستخدم)' }
  }
}

export async function updateAccount(id: string, data: FormData) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const hasPerm = session?.user?.permissions?.includes('accounts.edit')
  if (!isAdmin && !hasPerm) return { success: false, error: 'Unauthorized' }

  try {
    let permissions = []
    try {
      permissions = JSON.parse(data.get('permissions') as string || '[]')
    } catch (e) {}

    const password = data.get('password') as string
    
    const updateData: any = {
      name: data.get('name') as string,
      phone: data.get('phone') as string,
      role: data.get('role') as any,
      permissions: permissions,
    }

    if (password) {
      updateData.passwordHash = password
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    })
    revalidatePath('/admin/accounts')
    return { success: true }
  } catch(e) {
    return { success: false, error: 'فشل التحديث' }
  }
}

export async function updateAccountStatus(id: string, isActive: boolean) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const hasPerm = session?.user?.permissions?.includes('accounts.edit')
  if (!isAdmin && !hasPerm) throw new Error('Unauthorized')

  await prisma.user.update({
    where: { id },
    data: { isActive }
  })
  revalidatePath('/admin/accounts')
  return { success: true }
}

export async function deleteAccount(id: string) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'
  const hasPerm = session?.user?.permissions?.includes('accounts.delete')
  if (!isAdmin && !hasPerm) return { success: false, error: 'Unauthorized' }

  try {
    await prisma.user.delete({ where: { id } })
    revalidatePath('/admin/accounts')
    return { success: true }
  } catch(e) {
    return { success: false, error: 'فشل الحذف' }
  }
}

export async function updateProfile(data: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  try {
    const password = data.get('password') as string
    const updateData: any = {
      name: data.get('name') as string,
    }

    if (password) {
      updateData.passwordHash = password
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    })
  } catch(e) {
    return { success: false, error: 'فشل التحديث' }
  }
}
