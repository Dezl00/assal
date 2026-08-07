"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendNotification } from "@/lib/send-notification"

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const order = await db.order.findUnique({ where: { id: orderId }, include: { user: true } })
    if (!order) return { success: false, error: "Order not found" }

    await db.order.update({
      where: { id: orderId },
      data: { status }
    })

    // Send notification to customer if they exist and want updates
    if (order.userId) {
      const user = await db.user.findUnique({ where: { id: order.userId } })
      if (user?.orderUpdatesEnabled) {
        let statusAr = status === "PAID" ? "تم تأكيد ودفع الطلب" : status === "SHIPPED" ? "جاري الشحن" : status === "CANCELLED" ? "تم الإلغاء" : status
        await sendNotification({
          userId: order.userId,
          title: "تحديث حالة الطلب",
          message: `تم تحديث حالة طلبك #${orderId.slice(-6).toUpperCase()} إلى: ${statusAr}`,
          type: "ORDER_UPDATED",
          link: `/account?tab=orders`,
          sound: true
        })
      }
    }

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
