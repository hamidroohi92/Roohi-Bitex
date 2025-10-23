"use client";

import { useTheme } from "next-themes";

export default function PageCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { theme } = useTheme();
  console.log("theme", theme);
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
