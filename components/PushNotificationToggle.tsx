"use client";

import { useUser } from "@/components/UserProvider";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// Chuyển VAPID public key (base64url) sang Uint8Array cho pushManager.subscribe
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationToggle() {
  const { user, supabase } = useUser();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const supported =
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    !!vapidPublicKey;

  useEffect(() => {
    if (!supported) {
      setLoading(false);
      return;
    }

    const check = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const subscription = await registration.pushManager.getSubscription();
        setSubscribed(Boolean(subscription));
      } catch {
        // Không đăng ký được SW (trình duyệt chặn...) — coi như chưa bật
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [supported]);

  const enable = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError(
          "Bạn đã chặn thông báo. Hãy cho phép trong cài đặt trình duyệt.",
        );
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!),
      });

      const json = subscription.toJSON();
      const { error: dbError } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh: json.keys?.p256dh ?? "",
            auth: json.keys?.auth ?? "",
          },
          { onConflict: "endpoint" },
        );

      if (dbError) throw dbError;
      setSubscribed(true);
    } catch (err) {
      console.error(err);
      setError("Không bật được thông báo, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error(err);
      setError("Không tắt được thông báo, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        onClick={subscribed ? disable : enable}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 disabled:opacity-60 disabled:cursor-wait ${
          subscribed
            ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
        }`}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : subscribed ? (
          <Bell className="size-4" />
        ) : (
          <BellOff className="size-4" />
        )}
        {subscribed ? "Đang nhận thông báo" : "Bật thông báo"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
