import {
  buildEventPayload,
  PUSH_SUB_COLUMNS,
  pruneDeadSubscriptions,
  sendToSubscriptions,
} from "@/utils/push/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Trả về YYYY-MM-DD theo múi giờ Việt Nam, cộng thêm offsetDays
function vnDateString(offsetDays: number): string {
  const now = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// Giờ hiện tại (0-23) theo múi giờ Việt Nam
function vnHour(): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
  );
}

// Chạy 2 lần/ngày bởi Vercel Cron (vercel.json):
// - Sáng (7h VN): nhắc sự kiện hôm nay + ngày mai
// - Tối (18h VN): chỉ nhắc sự kiện ngày mai (hôm nay thường đã diễn ra xong)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ?slot=morning|evening để test tay; mặc định suy từ giờ VN lúc chạy
  const slotParam = new URL(request.url).searchParams.get("slot");
  const slot =
    slotParam === "morning" || slotParam === "evening"
      ? slotParam
      : vnHour() < 12
        ? "morning"
        : "evening";

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    );
  }

  const today = vnDateString(0);
  const tomorrow = vnDateString(1);
  // Buổi tối chỉ nhắc sự kiện ngày mai
  const targetDates = slot === "morning" ? [today, tomorrow] : [tomorrow];

  const [eventsRes, subsRes] = await Promise.all([
    supabase
      .from("custom_events")
      .select("name, event_date, location")
      .in("event_date", targetDates),
    supabase.from("push_subscriptions").select(PUSH_SUB_COLUMNS),
  ]);

  if (eventsRes.error || subsRes.error) {
    return NextResponse.json(
      { error: eventsRes.error?.message || subsRes.error?.message },
      { status: 500 },
    );
  }

  const events = eventsRes.data ?? [];
  const subs = subsRes.data ?? [];

  // Các sự kiện độc lập nhau → gửi song song thay vì tuần tự
  const results = await Promise.all(
    events.map((event) => {
      const prefix = event.event_date === today ? "Hôm nay" : "Ngày mai";
      return sendToSubscriptions(
        subs,
        buildEventPayload(`${prefix}: ${event.name}`, [
          event.location ? `Địa điểm: ${event.location}` : null,
        ]),
      );
    }),
  );

  const totalSent = results.reduce((n, r) => n + r.sent, 0);
  const allDead = new Set(results.flatMap((r) => r.deadEndpoints));
  const cleaned = await pruneDeadSubscriptions([...allDead]);

  return NextResponse.json({
    slot,
    events: events.length,
    subscriptions: subs.length,
    sent: totalSent,
    cleaned,
  });
}
