import React from "react"
import { db } from "@/lib/db"
import { CustomersClient } from "./customers-client"

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        orderBy: { createdAt: "desc" }
      },
      _count: {
        select: { orders: true }
      }
    }
  })

  return <CustomersClient customers={customers} />
}
