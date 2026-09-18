import React from "react"
import { db } from "@/lib/db"
import { unstable_cache } from "next/cache"
import { AdminLayoutClient } from "./admin-layout-client"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import type { Metadata } from "next"

export const revalidate = 3600

const getCachedAdminTheme = unstable_cache(
  async () => {
    return await db.themeConfig.findUnique({ where: { id: "default" } })
  },
  ['admin-theme-config'],
  { revalidate: 3600, tags: ['theme-config'] }
)

export async function generateMetadata(): Promise<Metadata> {
  const config = await getCachedAdminTheme()
  
  return {
    title: {
      template: '%s | لوحة التحكم',
      default: `${config?.storeName || 'المتجر'} - الإدارة`,
    },
    manifest: '/api/admin/manifest',
    themeColor: config?.adminColor || '#2453E3',
    icons: {
      icon: config?.faviconUrl || config?.logoUrl || '/favicon.ico',
      apple: config?.faviconUrl || config?.logoUrl || '/apple-icon.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: `${config?.storeName || 'المتجر'} - الإدارة`,
    },
    formatDetection: {
      telephone: false,
    },
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (session?.user?.id) {
    const getCachedUserStatus = unstable_cache(
      async (userId: string) => {
        return await db.user.findUnique({
          where: { id: userId },
          select: { isActive: true }
        })
      },
      [`admin-user-status-${session.user.id}`],
      { revalidate: 300, tags: ['user-status'] }
    )

    const dbUser = await getCachedUserStatus(session.user.id)
    
    if (!dbUser || dbUser.isActive === false) {
      redirect('/login?locked=true')
    }
  }

  const config = await getCachedAdminTheme()
  
  return (
    <AdminLayoutClient storeName={config?.storeName || "Assal Admin"} logoUrl={config?.logoUrl || null}>
      {children}
    </AdminLayoutClient>
  )
}
