import React from "react"
import { db } from "@/lib/db"
import { SettingsClient } from "./settings-client"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  let config = await db.themeConfig.findUnique({
    where: { id: "default" }
  })

  // Fallback to default if not exists
  if (!config) {
    config = {
      id: "default",
      storeName: "عسل طبيعي",
      storeDescription: "",
      logoUrl: null,
      faviconUrl: null,
      primaryColor: "#D97706",
      secondaryColor: "#FBBF24",
      borderRadius: "8px",
      buttonStyle: "solid",
      adminColor: "#0f172a",
      whatsappNumber: null,
      whatsappEnabled: true,
      facebookUrl: null,
      instagramUrl: null,
      snapchatUrl: null,
      tiktokUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any
  }

  const branches = await db.branch.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  const backups = await db.backup.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إعدادات المتجر</h1>
        <p className="mt-2 text-muted-foreground">قم بتخصيص مظهر المتجر والبيانات الأساسية والفروع والنسخ الاحتياطي.</p>
      </div>

      <SettingsClient config={config} branches={branches} backups={backups} />
    </div>
  )
}
