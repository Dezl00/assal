import React from "react"
import { AdminLayoutClient } from "../admin-layout-client"
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
    <AdminLayoutClient title="العروض والخصومات">
      <OffersClient 
        initialCoupons={coupons} 
        initialSettings={settings} 
      />
    </AdminLayoutClient>
  )
}
