import React from "react"
import { db } from "@/lib/db"
import { AdminLayoutClient } from "./admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const config = await db.themeConfig.findUnique({
    where: { id: "default" }
  })
  
  return (
    <AdminLayoutClient storeName={config?.storeName || "Assal Admin"} logoUrl={config?.logoUrl || null}>
      {children}
    </AdminLayoutClient>
  )
}
