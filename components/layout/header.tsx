"use client";

import ThemeToggle from "@/components/ui/themeToggle";

//Header component as a global top bar for the app
export default function Header() {
  const balance = 200000;
  return (
    <div className="flex justify-between items-center h-[10vh] bg-gray-300 dark:bg-gray-800 rounded-2xl p-4 transition-colors duration-300">
      <h1 className="text-gray-800 dark:text-gray-200 font-semibold">Hi, Hamid Roohi</h1>
      <div className="flex items-center gap-4">
        <h2 className="text-gray-800 dark:text-gray-200 font-semibold">Your Balance: ${balance}</h2>
        <ThemeToggle />
      </div>
    </div>
  );
}
