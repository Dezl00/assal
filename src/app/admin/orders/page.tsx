import React from "react"
import { db } from "@/lib/db"
import { OrdersClient } from "./orders-client"

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  return <OrdersClient orders={orders} />
}
