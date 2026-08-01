"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await db.order.update({
      where: { id: orderId },
      data: { status }
    })
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update order status" }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await db.order.delete({
      where: { id: orderId }
    })
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete order" }
  }
}
