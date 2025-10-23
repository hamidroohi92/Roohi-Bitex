"use client";

import ThemeToggle from "@/components/ui/themeToggle";
import { RootState } from "@/types/state";
import { formatCurrency } from "@/utils";
import { useSelector } from "react-redux";

//Header component as a global top bar for the app
export default function Header() {
  const { balance } = useSelector((state: RootState) => state.orderTicket);
  return (
    <div className="flex justify-between items-center h-[10vh] bg-gray-300 dark:bg-gray-800 rounded-2xl p-4 transition-colors duration-300">
      <div>
        <h1 className="text-gray-800 dark:text-gray-200 font-semibold">
          Hi, Hamid Roohi
        </h1>
        <h2 className="block md:hidden text-gray-800 dark:text-gray-200 font-semibold">
          Balance: {formatCurrency(balance.usd)}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <h2 className="hidden md:block text-gray-800 dark:text-gray-200 font-semibold">
          Balance: {formatCurrency(balance.usd)}
        </h2>
        <ThemeToggle />
      </div>
    </div>
  );
}
