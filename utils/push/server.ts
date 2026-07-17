import webpush from "web-push";

export interface PushSubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

export const isPushConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

if (isPushConfigured) {
  webpush.setVapidDetails(
    "mailto:phu.ledinh123@gmail.com",
    vapidPublicKey!,
    vapidPrivateKey!,
  );
}

/**
 * Gửi payload tới danh sách subscription.
 * Trả về danh sách endpoint đã chết (404/410) để caller xóa khỏi DB.
 */
export async function sendToSubscriptions(
  subscriptions: PushSubscriptionRow[],
  payload: PushPayload,
): Promise<{ sent: number; deadEndpoints: string[] }> {
  if (!isPushConfigured || subscriptions.length === 0) {
    return { sent: 0, deadEndpoints: [] };
  }

  const body = JSON.stringify(payload);
  const deadEndpoints: string[] = [];
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
        );
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          deadEndpoints.push(sub.endpoint);
        } else {
          console.error("Push send failed:", statusCode, sub.endpoint);
        }
      }
    }),
  );

  return { sent, deadEndpoints };
}
