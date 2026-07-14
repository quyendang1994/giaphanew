"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const galleryPhotos = [
  { src: "/about/le-ky-phuc-1.jpg", alt: "Mâm lễ dâng cúng tại Lễ Kỳ Phúc" },
  {
    src: "/about/le-ky-phuc-2.jpg",
    alt: "Lễ vật của các gia đình họ Đặng Đình dâng lễ",
  },
  {
    src: "/about/le-ky-phuc-3.jpg",
    alt: "Mâm bánh chưng dâng lễ trong đền làng Thanh Hòa",
  },
  {
    src: "/about/le-ky-phuc-4.jpg",
    alt: "Gà lễ tạo hình cánh phượng trong Lễ Kỳ Phúc",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] selection:bg-amber-200 selection:text-amber-900 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>

      <Link href="/dashboard" className="btn absolute top-6 left-6 z-20">
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại
      </Link>

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-20 relative z-10 w-full mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-3xl w-full"
        >
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200 mb-8 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-100/50 text-amber-700 rounded-2xl">
                <Info className="size-6" />
              </div>
              <h1 className="title">Giới thiệu về họ Đặng Đình</h1>
            </div>

            <div className="max-w-none">
              <p className="text-stone-600 leading-relaxed text-[15px]">
                <strong className="text-stone-800">Họ Đặng Đình</strong> là một
                dòng họ có truyền thống lâu đời, trải qua bao thế hệ vẫn gìn giữ
                được những giá trị cội nguồn tốt đẹp. Cuốn gia phả điện tử này
                được lập nên nhằm ghi lại công đức tổ tiên, lưu giữ thông tin các
                thành viên trong dòng họ, để con cháu muôn đời sau luôn nhớ về
                gốc rễ, biết ơn tiền nhân và tiếp nối truyền thống gia phong.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200 mb-8">
            <p className="text-stone-600 leading-relaxed text-[15px] mb-8">
              Một vài hình ảnh của con cháu họ Đặng Đình trong dịp thành tâm dâng
              lễ, tưởng nhớ tổ tiên và cầu mong bình an, phúc lộc cho cả dòng họ.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {galleryPhotos.map((photo) => (
                <div
                  key={photo.src}
                  className="group relative aspect-3/4 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 320px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Kết nối với dòng họ
            </p>
            <a
              href="https://www.facebook.com/DangDinhQuyen04/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0f66d6] transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Đặng Đình Quyền
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
