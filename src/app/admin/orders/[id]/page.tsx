import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { OrderDetailsClient } from "./order-details-client"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminOrderPage({ params }: { params: { id: string } }) {
  const session = await auth()
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    redirect("/")
  }

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true,
    }
  })

  if (!order) {
    notFound()
  }

  const config = await db.themeConfig.findUnique({
    where: { id: "default" }
  })

  return <OrderDetailsClient order={order} logoUrl={config?.logoUrl} storeName={config?.storeName} />
}
