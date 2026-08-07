import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/send-notification";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "PENDING" && order.status !== "PAID") {
      return NextResponse.json({ error: "Cannot cancel order in this status" }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    });

    // Notify Admins
    const config = await prisma.themeConfig.findUnique({ where: { id: "default" } });
    if (config?.adminOrderNotifications !== false) {
      await sendNotification({
        userId: undefined,
        targetRole: "ADMIN",
        title: "إلغاء طلب",
        message: `قام العميل بإلغاء الطلب #${orderId.slice(-6).toUpperCase()}`,
        type: "ORDER_CANCELLED",
        link: `/admin/orders/${orderId}`,
        sound: true
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
