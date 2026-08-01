"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateThemeConfig(formData: FormData) {
  try {
    const storeName = formData.get("storeName") as string
    const storeDescription = formData.get("storeDescription") as string
    const logoUrl = formData.get("logoUrl") as string
    const primaryColor = formData.get("primaryColor") as string
    const secondaryColor = formData.get("secondaryColor") as string

    // UPSERT the first configuration record
    await db.themeConfig.upsert({
      where: { id: "default" },
      update: {
        storeName,
        storeDescription,
        logoUrl,
        primaryColor,
        secondaryColor,
      },
      create: {
        id: "default",
        storeName,
        storeDescription,
        logoUrl,
        primaryColor,
        secondaryColor,
      }
    })

    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to save settings" }
  }
}
