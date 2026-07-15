"use client";

import { motion } from "framer-motion";

interface ShimmerTextProps {
  text: string;
  className?: string;
}

/**
 * Hiệu ứng chữ "long lanh" (shimmer): một dải sáng vàng gold quét ngang
 * chữ theo vòng lặp. Chữ kế thừa font/size từ phần tử cha bao ngoài.
 */
export default function ShimmerText({ text, className }: ShimmerTextProps) {
  return (
    <motion.span
      className={`inline-block bg-clip-text text-transparent ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(110deg, #b45309 0%, #b45309 40%, #fcd34d 50%, #b45309 60%, #b45309 100%)",
        backgroundSize: "200% 100%",
      }}
      animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 0.5,
      }}
    >
      {text}
    </motion.span>
  );
}
