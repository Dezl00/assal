"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

async function checkAdmin() {
  const session = await auth()
  if (!session || !session.user) throw new Error("Unauthorized")
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error("Unauthorized")
  }
}

// -- Coupons --

export async function getCoupons() {
  return await db.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createCoupon(data: { code: string; type: string; value: number; maxUses?: number | null; expiresAt?: Date | null; isActive?: boolean }) {
  await checkAdmin()
  const exists = await db.coupon.findUnique({ where: { code: data.code } })
  if (exists) throw new Error("هذا الكود موجود مسبقاً")

  const coupon = await db.coupon.create({ data })
  revalidatePath('/admin/offers')
  return coupon
}

export async function updateCoupon(id: string, data: { code?: string; type?: string; value?: number; maxUses?: number | null; expiresAt?: Date | null; isActive?: boolean }) {
  await checkAdmin()
  const coupon = await db.coupon.update({ where: { id }, data })
  revalidatePath('/admin/offers')
  return coupon
}

export async function deleteCoupon(id: string) {
  await checkAdmin()
  await db.coupon.delete({ where: { id } })
  revalidatePath('/admin/offers')
  return { success: true }
}

// -- Offer Settings (ThemeConfig) --

export async function getOfferSettings() {
  const theme = await db.themeConfig.findUnique({ where: { id: "default" } })
  return {
    freeShippingThreshold: theme?.freeShippingThreshold,
    promoPopupEnabled: theme?.promoPopupEnabled,
    promoPopupDelay: theme?.promoPopupDelay,
    promoPopupTitle: theme?.promoPopupTitle,
    promoPopupDescription: theme?.promoPopupDescription,
    promoPopupCode: theme?.promoPopupCode,
    whatsappOrderEnabled: theme?.whatsappOrderEnabled ?? false,
    whatsappNumber: theme?.whatsappNumber ?? null,
  }
}

export async function updateOfferSettings(data: any) {
  await checkAdmin()
  
  // ensure default config exists
  const existing = await db.themeConfig.findUnique({ where: { id: "default" } })
  if (!existing) {
    await db.themeConfig.create({ data: { id: "default", ...data } })
  } else {
    await db.themeConfig.update({ where: { id: "default" }, data })
  }
  
  revalidatePath('/admin/offers')
  revalidatePath('/') // Revalidate storefront to update popup settings
  return { success: true }
}
