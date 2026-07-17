import { sendToSubscriptions } from "@/utils/push/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Gửi thông báo đẩy tới mọi thiết bị đã đăng ký khi có sự kiện mới.
// Được gọi fire-and-forget từ CustomEventModal sau khi tạo sự kiện.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    const [y, m, d] = body.event_date.split("-");
    if (y && m && d) details.push(`Ngày ${d}/${m}/${y}`);
  }
  if (body.location) details.push(`tại ${body.location.slice(0, 80)}`);

  // Không gửi cho chính người tạo sự kiện
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .neq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { sent, deadEndpoints } = await sendToSubscriptions(subs ?? [], {
    title: `Sự kiện mới: ${name}`,
    body: details.join(" ") || "Xem chi tiết trong trang Sự kiện gia phả.",
    url: "/dashboard/events",
  });

  if (deadEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", deadEndpoints);
  }

  return NextResponse.json({ sent, cleaned: deadEndpoints.length });
}
