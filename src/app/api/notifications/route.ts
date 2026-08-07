import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const userId = session.user.id;
    const isAdmin = role === "ADMIN" || role === "MANAGER";

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: isAdmin ? { userId: null } : { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: isAdmin ? { userId: null, isRead: false } : { userId, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json(); // Array of notification IDs to mark as read

    const role = session.user.role;
    const userId = session.user.id;
    const isAdmin = role === "ADMIN" || role === "MANAGER";

    await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        ...(isAdmin ? { userId: null } : { userId })
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
