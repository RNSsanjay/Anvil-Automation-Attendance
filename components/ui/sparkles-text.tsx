'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklesTextProps {
  text: string;
  className?: string;
  sparklesCount?: number;
  colors?: {
    first: string;
    second: string;
  };
}

const Sparkle = ({ color, size, style }: { color: string; size: number; style: any }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    style={style}
    className="absolute z-10"
    initial={{ scale: 0, rotate: 0 }}
    animate={{ scale: [0, 1, 0], rotate: [0, 90, 180] }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
  >
    <path
      d="M80 0C80 0 80 44.1828 80 80C80 115.817 80 160 80 160C80 160 80 115.817 80 80C80 44.1828 80 0 80 0Z"
      fill={color}
    />
    <path
      d="M0 80C0 80 44.1828 80 80 80C115.817 80 160 80 160 80C160 80 115.817 80 80 80C44.1828 80 0 80 0 80Z"
      fill={color}
    />
  </motion.svg>
);

const SparklesText: React.FC<SparklesTextProps> = ({
  text,
  className,
  sparklesCount = 10,
  colors = { first: "#7C3AED", second: "#A78BFA" },
}) => {
  const [sparkles, setSparkles] = useState<any[]>([]);

  useEffect(() => {
    const generateSparkle = () => ({
      id: Math.random(),
      color: Math.random() > 0.5 ? colors.first : colors.second,
      size: Math.random() * 10 + 10,
      style: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      },
    });

    const interval = setInterval(() => {
      setSparkles((prev) => [...prev.slice(-sparklesCount), generateSparkle()]);
    }, 400);

    return () => clearInterval(interval);
  }, [sparklesCount, colors]);

  return (
    <div className={cn("relative inline-block", className)}>
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} {...sparkle} />
      ))}
      <span className="relative z-0">{text}</span>
    </div>
  );
};

export default SparklesText;