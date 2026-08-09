import React from "react"
import { db } from "@/lib/db"
import { AdminLayoutClient } from "./admin-layout-client"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (session?.user?.id) {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isActive: true }
    })
    
    if (!dbUser || dbUser.isActive === false) {
      redirect('/login?locked=true')
    }
  }

  const config = await db.themeConfig.findUnique({
    where: { id: "default" }
  })
  
  return (
    <AdminLayoutClient storeName={config?.storeName || "Assal Admin"} logoUrl={config?.logoUrl || null}>
      {children}
    </AdminLayoutClient>
  )
}
