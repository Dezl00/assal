"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateThemeConfig(formData: FormData) {
  try {
    const existing = await db.themeConfig.findUnique({ where: { id: "default" } })
    const data: any = {}
    
    const stringFields = [
      "storeName", "storeDescription", "logoUrl", "faviconUrl",
      "primaryColor", "secondaryColor", "adminColor", "whatsappNumber",
      "facebookUrl", "instagramUrl", "twitterUrl", "tiktokUrl", "snapchatUrl", "backupFrequency"
    ]

    stringFields.forEach(field => {
      if (formData.has(field)) {
        data[field] = formData.get(field) as string
      }
    })

    // Special case for boolean checkbox which is omitted if unchecked
    if (formData.has("whatsappNumber") || formData.has("whatsappEnabled")) {
      data.whatsappEnabled = formData.get("whatsappEnabled") === "true"
    }

    if (!existing) {
      // If creating for the first time, ensure required fields have fallback
      data.storeName = data.storeName || "متجر عسل"
    }

    await db.themeConfig.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", storeName: "متجر عسل", ...data }
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

export async function resetStoreStats() {
  try {
    // Delete order items first to satisfy foreign keys
    await db.orderItem.deleteMany({})
    // Delete orders
    await db.order.deleteMany({})
    // Delete analytics data
    await db.pageVisit.deleteMany({})
    await db.productView.deleteMany({})
    // Delete notifications and activity logs
    await db.notification.deleteMany({})
    await db.activityLog.deleteMany({})
    
    revalidatePath("/admin/analytics")
    revalidatePath("/admin/orders")
    revalidatePath("/admin/settings")
    revalidatePath("/admin/security")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "فشل في تصفير بيانات المتجر" }
  }
}
