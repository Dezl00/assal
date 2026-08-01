import React from "react"
import { db } from "@/lib/db"
import { CustomersClient } from "./customers-client"

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true }
      }
    }
  })

  return <CustomersClient customers={customers} />
}
