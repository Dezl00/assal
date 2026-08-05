"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateThemeConfig(formData: FormData) {
  try {
    const storeName = formData.get("storeName") as string
    const storeDescription = formData.get("storeDescription") as string
    const logoUrl = formData.get("logoUrl") as string
    const faviconUrl = formData.get("faviconUrl") as string
    const primaryColor = formData.get("primaryColor") as string
    const secondaryColor = formData.get("secondaryColor") as string
    const adminColor = formData.get("adminColor") as string
    const whatsappNumber = formData.get("whatsappNumber") as string
    const whatsappEnabled = formData.get("whatsappEnabled") === "true"
    const facebookUrl = formData.get("facebookUrl") as string
    const instagramUrl = formData.get("instagramUrl") as string
    const twitterUrl = formData.get("twitterUrl") as string
    const tiktokUrl = formData.get("tiktokUrl") as string
    const snapchatUrl = formData.get("snapchatUrl") as string
    const backupFrequency = formData.get("backupFrequency") as string

    const data = {
      storeName,
      storeDescription,
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      adminColor,
      whatsappNumber,
      whatsappEnabled,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      tiktokUrl,
      snapchatUrl,
      ...(backupFrequency ? { backupFrequency } : {})
    }

    await db.themeConfig.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data }
    })

    revalidatePath("/admin/settings")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("Save settings error:", error)
    return { success: false, error: "فشل حفظ الاعدادات: " + (error?.message || String(error)) }
  }
}

export async function createBranch(formData: FormData) {
  try {
    await db.branch.create({
      data: {
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        mapUrl: formData.get("mapUrl") as string,
      }
    })
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to create branch" }
  }
}

export async function updateBranch(id: string, formData: FormData) {
  try {
    await db.branch.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        mapUrl: formData.get("mapUrl") as string,
        isActive: formData.get("isActive") === "true",
      }
    })
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update branch" }
  }
}

export async function deleteBranch(id: string) {
  try {
    await db.branch.delete({ where: { id } })
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete branch" }
  }
}
