import React from "react"

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
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">الدفع والشحن</h1>
        <p className="text-muted-foreground mt-2">إدارة طرق الدفع ومناطق الشحن وتكاليفها لكل مدينة.</p>
      </div>
      <ShippingPaymentClient 
        initialGovernorates={governorates} 
        initialPaymentMethods={paymentMethods} 
      />
    </div>
  )
}
