import React from "react"

import { OffersClient } from "./offers-client"
import { getCoupons, getOfferSettings } from "@/features/offers/actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "العروض والخصومات",
}

export default async function OffersPage() {
  const coupons = await getCoupons()
  const settings = await getOfferSettings()

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">العروض والخصومات</h1>
        <p className="text-muted-foreground mt-2">إدارة أكواد الخصم والنافذة المنبثقة الترحيبية وإعدادات الشحن المجاني.</p>
      </div>
      <OffersClient 
        initialCoupons={coupons} 
        initialSettings={settings} 
      />
    </div>
  )
}
