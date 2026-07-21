import { createAdminClient } from "@/utils/supabase/admin";
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

// Cột subscription cần cho việc gửi push — giữ chung để trùng với PushSubscriptionRow
export const PUSH_SUB_COLUMNS = "endpoint, p256dh, auth";
// Trang mở khi bấm vào thông báo (dùng chung cho cả hai route gửi push)
export const EVENTS_URL = "/dashboard/events";
const DEFAULT_BODY = "Xem chi tiết trong trang Sự kiện gia phả.";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidContact =
  process.env.VAPID_CONTACT_EMAIL || "mailto:example@giapha-os.local";

export const isPushConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

if (isPushConfigured) {
  webpush.setVapidDetails(
    vapidContact.startsWith("mailto:") ? vapidContact : `mailto:${vapidContact}`,
    vapidPublicKey!,
    vapidPrivateKey!,
  );
}

/**
 * Dựng payload thông báo cho một sự kiện: tiêu đề tùy route, phần chi tiết
 * (ngày/địa điểm) ghép lại, và fallback + url dùng chung.
 */
export function buildEventPayload(
  title: string,
  detailParts: (string | null | undefined)[],
): PushPayload {
  const body = detailParts.filter(Boolean).join(" ") || DEFAULT_BODY;
  return { title, body, url: EVENTS_URL };
}

/**
 * Xóa các subscription đã chết bằng admin client (bỏ qua RLS) — các endpoint
 * này thường thuộc về người dùng khác nên session thường không xóa được.
 * Trả về số dòng đã yêu cầu xóa.
 */
export async function pruneDeadSubscriptions(
  endpoints: string[],
): Promise<number> {
  if (endpoints.length === 0) return 0;
  const admin = createAdminClient();
  if (!admin) return 0;
  await admin.from("push_subscriptions").delete().in("endpoint", endpoints);
  return endpoints.length;
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
