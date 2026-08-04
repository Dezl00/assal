import { auth } from "@/lib/auth"
import CheckoutClient from "./checkout-client"
import { db } from "@/lib/db"

import { Suspense } from "react"

export default async function CheckoutPage() {
  const session = await auth()
  
  let userDetails = null
  
  if (session?.user?.email) {
    const dbUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { name: true, email: true, phone: true, address: true }
    })
    if (dbUser) {
      userDetails = dbUser
    }
  }

  return (
    <Suspense fallback={<div className="container mx-auto p-8 text-center">جاري تحميل صفحة الدفع...</div>}>
      <CheckoutClient user={userDetails} />
    </Suspense>
  )
}
