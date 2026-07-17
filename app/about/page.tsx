"use client";

import { motion, MotionConfig } from "framer-motion";
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

/* Hạt bụi sáng lơ lửng — vị trí/kích thước cố định để tránh lệch hydration */
const dustParticles = [
  { left: "8%", top: "22%", size: 9, duration: 7, delay: 0 },
  { left: "15%", top: "65%", size: 6, duration: 9, delay: 1.2 },
  { left: "28%", top: "12%", size: 7, duration: 6, delay: 2.4 },
  { left: "55%", top: "8%", size: 6, duration: 8, delay: 0.8 },
  { left: "70%", top: "78%", size: 9, duration: 10, delay: 1.8 },
  { left: "84%", top: "30%", size: 8, duration: 7, delay: 3 },
  { left: "92%", top: "62%", size: 6, duration: 9, delay: 0.4 },
  { left: "40%", top: "88%", size: 7, duration: 8, delay: 2 },
  { left: "5%", top: "45%", size: 6, duration: 8, delay: 1.5 },
  { left: "78%", top: "10%", size: 7, duration: 9, delay: 2.8 },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function AboutPage() {
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex flex-col bg-[#fafaf9] selection:bg-amber-200 selection:text-amber-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#fef3c7,transparent)] pointer-events-none"></div>

      {/* Đốm sáng mờ trang trí, trôi chậm rãi */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none flex justify-center">
        <motion.div
          animate={{ x: [0, -120, 0], y: [0, 80, 0], scale: [1, 1.25, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-amber-300/30 rounded-full blur-[100px] mix-blend-multiply"
        />
        <motion.div
          animate={{ x: [0, 110, 0], y: [0, -70, 0], scale: [1, 1.18, 1] }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-[20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-rose-200/30 rounded-full blur-[120px] mix-blend-multiply"
        />
      </div>

      {/* Hạt bụi sáng lơ lửng như bụi nắng */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {dustParticles.map((p, i) => (
          <motion.span
            key={i}
            animate={{
              y: [0, -60, 0],
              x: [0, i % 2 === 0 ? 24 : -24, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              boxShadow: "0 0 12px 3px rgba(245, 158, 11, 0.35)",
            }}
            className="absolute rounded-full bg-amber-500/80"
          />
        ))}
      </div>

      <Link href="/dashboard" className="btn absolute top-6 left-6 z-20">
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại
      </Link>

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-20 relative z-10 w-full mb-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="max-w-3xl w-full"
        >
          <motion.div
            variants={sectionVariants}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200 mb-8 mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.25,
                }}
                className="p-3 bg-amber-100/50 text-amber-700 rounded-2xl"
              >
                <Info className="size-6" />
              </motion.div>
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
          </motion.div>

          <motion.div
            variants={sectionVariants}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200 mb-8"
          >
            <p className="text-stone-600 leading-relaxed text-[15px] mb-8">
              Một vài hình ảnh của con cháu họ Đặng Đình trong dịp thành tâm dâng
              lễ, tưởng nhớ tổ tiên và cầu mong bình an, phúc lộc cho cả dòng họ.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {galleryPhotos.map((photo, index) => (
                <motion.div
                  key={photo.src}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="group relative aspect-3/4 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 320px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Chú thích ảnh trượt lên khi hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-10 pb-3 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <p className="text-white text-xs sm:text-[13px] leading-snug">
                      {photo.alt}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={sectionVariants}
            className="flex flex-col items-center gap-3 mb-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Kết nối với dòng họ
            </p>
            <a
              href="https://www.facebook.com/DangDinhQuyen04/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0f66d6] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
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
          </motion.div>
        </motion.div>
      </div>
    </div>
    </MotionConfig>
  );
}
