import React from "react"
import { AdminLayoutClient } from "../admin-layout-client"
import { ShippingPaymentClient } from "./shipping-payment-client"
import { getGovernorates, getPaymentMethods } from "@/features/shipping-payment/actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "الدفع والشحن",
}

export default async function ShippingPaymentPage() {
  const governorates = await getGovernorates()
  const paymentMethods = await getPaymentMethods()

  return (
    <AdminLayoutClient title="الدفع والشحن">
      <ShippingPaymentClient 
        initialGovernorates={governorates} 
        initialPaymentMethods={paymentMethods} 
      />
    </AdminLayoutClient>
  )
}
