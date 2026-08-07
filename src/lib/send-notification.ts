import { db as prisma } from "@/lib/db";
import { webpush } from "@/lib/web-push";

interface SendNotificationOptions {
  userId?: string; // If null, target admins
  targetRole?: "ADMIN" | "CUSTOMER"; 
  title: string;
  message: string;
  type: string;
  link?: string;
  sound?: boolean; // Whether to play sound for push
  image?: string;  // Large image to display in the push notification
}

export async function sendNotification({ userId, targetRole, title, message, type, link, sound = true, image }: SendNotificationOptions) {
  try {
    // 1. Save to database (in-app notification)
    // If it's an admin notification (userId is null), we just save one record with userId = null.
    // The admin dashboard will fetch notifications where userId = null.
    await prisma.notification.create({
      data: {
        userId: userId || null,
        title,
        message,
        type,
        link,
      }
    });

    // 2. Find push subscriptions
    let pushSubs: any[] = [];
    if (userId) {
      pushSubs = await prisma.pushSubscription.findMany({
        where: { userId }
      });
    } else if (targetRole === "ADMIN") {
      // Find subscriptions that belong to ADMIN or MANAGER
      pushSubs = await prisma.pushSubscription.findMany({
        where: { role: "ADMIN" }
      });
    }

    // 3. Send Web Push
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/icon-512x512.png', // Assuming PWA icon exists, fallback to favicon
      image: image || undefined,
      url: link || '/',
      vibrate: sound ? [200, 100, 200, 100, 200, 100, 200] : [200],
      sound: sound ? '/sounds/bell.ogg' : undefined,
    });

    const sendPromises = pushSubs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            }
          },
          payload
        );
      } catch (error: any) {
        // If subscription is invalid/expired (410), delete it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Error sending push notification to endpoint:", sub.endpoint, error);
        }
      }
    });

    await Promise.all(sendPromises);
    
    return { success: true };
  } catch (error) {
    console.error("Error in sendNotification:", error);
    return { success: false, error };
  }
}

