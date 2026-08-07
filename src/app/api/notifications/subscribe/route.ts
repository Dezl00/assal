import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const userId = session?.user?.id;
    const role = session?.user?.role || "GUEST";
    
    // We allow guests to subscribe too, but we track their subscriptions without userId if needed.
    // However, usually we only notify registered users or admins.
    // For admin, if role is ADMIN, we flag it.

    const existingSub = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (!existingSub) {
      await prisma.pushSubscription.create({
        data: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userId: userId || null,
          role: role === "ADMIN" || role === "MANAGER" ? "ADMIN" : "CUSTOMER"
        }
      });
    } else {
      // Update userId and role in case they logged in on the same browser
      await prisma.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          userId: userId || existingSub.userId,
          role: role === "ADMIN" || role === "MANAGER" ? "ADMIN" : "CUSTOMER"
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
