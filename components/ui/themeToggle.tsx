import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  const handleMount = useCallback(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    handleMount();
  }, []);

  if (!mounted) {
    return;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  return (
    <button
      suppressHydrationWarning
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
