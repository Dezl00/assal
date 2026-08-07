"use server"
import { db } from "@/lib/db"

export async function submitOrder(data: {
  customerName: string
  customerPhone: string
  address: string
  city: string
  governorate?: string
  paymentMethod?: string
  shippingCost?: number
  discount?: number
  couponCode?: string
  items: { productId: string; quantity: number; price: number }[]
  totalAmount: number
  userId?: string
}) {
  try {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "السلة فارغة" }
    }

    const orderData: any = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      address: data.address,
      city: data.city,
      governorate: data.governorate,
      paymentMethod: data.paymentMethod,
      shippingCost: data.shippingCost || 0,
      discount: data.discount || 0,
      couponCode: data.couponCode,
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

    if (data.userId) {
      orderData.userId = data.userId
      
      // Update user's address/phone for future uses
      await db.user.update({
        where: { id: data.userId },
        data: {
          phone: data.customerPhone,
          address: data.address
        }
      })
    }

    const order = await db.order.create({
      data: orderData
    })

    if (data.couponCode) {
      await db.coupon.update({
        where: { code: data.couponCode },
        data: { usedCount: { increment: 1 } }
      })
    }
    
    // Notify Admin
    const { sendNotification } = await import("@/lib/send-notification")
    const config = await db.themeConfig.findUnique({ where: { id: "default" } })
    if (config?.adminOrderNotifications !== false) {
      await sendNotification({
        userId: undefined, // Admins
        targetRole: "ADMIN",
        title: "طلب جديد",
        message: `تم استلام طلب جديد #${order.id.slice(-6).toUpperCase()} بقيمة ${order.totalAmount} ج.م`,
        type: "ORDER_CREATED",
        link: `/admin/orders/${order.id}`,
        sound: true
      })
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Order submission failed:", error)
    return { success: false, error: "حدث خطأ أثناء معالجة الطلب" }
  }
}

export async function validateCoupon(code: string) {
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() }
  })
  
  if (!coupon) return { error: "كود الخصم غير صحيح" }
  if (!coupon.isActive) return { error: "هذا الكود غير مفعل" }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { error: "لقد تم تجاوز الحد الأقصى لاستخدام هذا الكود" }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { error: "هذا الكود منتهي الصلاحية" }

  return { success: true, coupon }
}
