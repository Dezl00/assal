import React from "react"
import { db } from "@/lib/db"
import { MenuItemsClient } from "./menu-items-client"
import { notFound } from "next/navigation"

export default async function AdminMenuItemsPage({ params }: { params: { id: string } }) {
  const menu = await db.menu.findUnique({
    where: { id: params.id },
    include: {
      items: {
        orderBy: { sortOrder: "asc" }
      }
    }
  })

  if (!menu) {
    notFound()
  }

  return <MenuItemsClient menu={menu} />
}
