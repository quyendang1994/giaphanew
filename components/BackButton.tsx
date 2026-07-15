"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Nút "Quay lại" dùng chung cho các màn hình trong dashboard.
 * Ẩn ở trang chủ dashboard (/dashboard) vì đó là màn cấp cao nhất.
 */
export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/dashboard") return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
      <button
        type="button"
        onClick={() => router.back()}
        className="btn group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        Quay lại
      </button>
    </div>
  );
}
