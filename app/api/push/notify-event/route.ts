import { formatDisplayDate } from "@/utils/dateHelpers";
import {
  buildEventPayload,
  PUSH_SUB_COLUMNS,
  pruneDeadSubscriptions,
  sendToSubscriptions,
} from "@/utils/push/server";
import { getSupabase, getUser } from "@/utils/supabase/queries";
import { NextResponse } from "next/server";

// Gửi thông báo đẩy tới mọi thiết bị đã đăng ký khi có sự kiện mới.
// Được gọi fire-and-forget từ CustomEventModal sau khi tạo sự kiện.
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; event_date?: string; location?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = (body.name || "").trim().slice(0, 120);
  if (!name) {
    return NextResponse.json({ error: "Missing event name" }, { status: 400 });
  }

  const details: string[] = [];
  if (body.event_date) {
    const [y, m, d] = body.event_date.split("-").map(Number);
    if (y && m && d) details.push(`Ngày ${formatDisplayDate(y, m, d)}`);
  }
  if (body.location) details.push(`tại ${body.location.slice(0, 80)}`);

  const supabase = await getSupabase();

  // Không gửi cho chính người tạo sự kiện
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select(PUSH_SUB_COLUMNS)
    .neq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { sent, deadEndpoints } = await sendToSubscriptions(
    subs ?? [],
    buildEventPayload(`Sự kiện mới: ${name}`, details),
  );

  const cleaned = await pruneDeadSubscriptions(deadEndpoints);

  return NextResponse.json({ sent, cleaned });
}
