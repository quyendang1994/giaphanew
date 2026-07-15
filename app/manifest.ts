import type { MetadataRoute } from "next";
import config from "./config";

// PWA manifest — cho phép "Thêm vào màn hình chính" và chạy như app
// (standalone, không có thanh địa chỉ trình duyệt).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: config.siteName,
    short_name: config.siteName,
    description:
      "Gia phả điện tử dòng họ — lưu giữ cội nguồn, kết nối các thế hệ.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#fafaf9",
    lang: "vi",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
