"use server"
import { db } from "@/lib/db"

export async function submitOrder(data: {
  customerName: string
  customerPhone: string
  address: string
  city: string
  items: { productId: string; quantity: number; price: number }[]
  totalAmount: number
}) {
  try {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "السلة فارغة" }
    }

    const order = await db.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        address: data.address,
        city: data.city,
        totalAmount: data.totalAmount,
        status: "PENDING",
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Order submission failed:", error)
    return { success: false, error: "حدث خطأ أثناء معالجة الطلب" }
  }
}
