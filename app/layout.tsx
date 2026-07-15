import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import config from "./config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});
const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
});
// Font thư pháp cho câu đối. Đổi `src` sang file khác trong app/fonts để dùng
// kiểu khác: fz-thuphap-giaolong.ttf, fz-thuphap-butbi.ttf, ...
const thuphap = localFont({
  src: "./fonts/fz-ducthuy-thuphap.ttf",
  variable: "--font-thuphap",
  display: "swap",
});
export const metadata: Metadata = {
  title: config.siteName,
  description: config.siteName,
  // iOS: chạy toàn màn hình khi thêm vào màn hình chính
  appleWebApp: {
    capable: true,
    title: config.siteName,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${playfair.variable} ${thuphap.variable} font-sans antialiased relative`}
      >
        {children}
      </body>
    </html>
  );
}
