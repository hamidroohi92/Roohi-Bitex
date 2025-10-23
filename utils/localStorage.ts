import { SimulatedBalance } from "@/types/trade";

const BALANCE_STORAGE_KEY = "bitex_simulated_balance";

export const loadBalanceFromStorage = (): SimulatedBalance | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(BALANCE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the structure
      if (typeof parsed.usd === "number" && typeof parsed.btc === "number") {
        return parsed as SimulatedBalance;
      }
    }
  } catch (error) {
    console.warn("Failed to load balance from localStorage:", error);
  }

  return null;
};

export const saveBalanceToStorage = (balance: SimulatedBalance): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(balance));
  } catch (error) {
    console.warn("Failed to save balance to localStorage:", error);
  }
};

export const clearBalanceFromStorage = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(BALANCE_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear balance from localStorage:", error);
  }
};
