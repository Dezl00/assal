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
      updatedAt: new Date(),
    }
  }

  return <SettingsClient config={config} />
}
