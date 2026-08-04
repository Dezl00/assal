import React from "react"
import { db } from "@/lib/db"
import { DepartmentsClient } from "./departments-client"

export const dynamic = "force-dynamic"

export default async function AdminDepartmentsPage() {
  const departments = await db.department.findMany({
    include: {
      _count: {
        select: { categories: true, products: true }
      }
    },
    orderBy: { name: "asc" },
  })
  return <DepartmentsClient departments={departments} />
}
