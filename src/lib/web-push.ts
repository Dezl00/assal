import webpush from 'web-push';

const vapidPublicKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '').trim().replace(/=/g, '');
const vapidPrivateKey = (process.env.VAPID_PRIVATE_KEY || '').trim().replace(/=/g, '');

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(
      'mailto:test@example.com',
      vapidPublicKey,
      vapidPrivateKey
    );
  } catch (error) {
    console.error("Failed to initialize web-push:", error);
  }
}

export { webpush };
