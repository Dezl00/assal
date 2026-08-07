import React from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AccountClient } from "./account-client"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "حسابي | عسل",
}

export default async function AccountPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: {
        orderBy: { createdAt: "desc" }
      },
      contactNumbers: {
        orderBy: { createdAt: "desc" }
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                include: { images: true }
              }
            }
          }
        }
      }
    }
  })

  if (!user) {
    redirect("/")
  }

  // Serialize Date objects to strings before passing to Client Component
  const serializedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    orders: user.orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
    addresses: user.addresses.map((addr) => ({
      ...addr,
      createdAt: addr.createdAt.toISOString(),
      updatedAt: addr.updatedAt.toISOString(),
    })),
    contactNumbers: user.contactNumbers.map((contact) => ({
      ...contact,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }))
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 min-h-[70vh]">
      <AccountClient user={serializedUser} />
    </div>
  )
}
