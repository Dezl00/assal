import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CustomerOrderDetailsClient } from "./customer-order-details-client"

export default async function CustomerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  
  if (!session || !session.user) {
    redirect("/")
  }

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id: id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true,
    }
  })

  if (!order || order.userId !== session.user.id) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      <CustomerOrderDetailsClient order={order} />
    </div>
  )
}
