"use client";

import { useTheme } from "next-themes";
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === "light"
        ? // Moon icon for dark mode
          "Light"
        : // Sun icon for light mode
          "dark"}
    </button>
  );
}
