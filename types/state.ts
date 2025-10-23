import { Candle } from "./trade";

export interface AppState {
  isLoading: boolean;
  darkMode: boolean;
}

export interface SymbolState {
  symbol: string;
  currentPrice: number;
  candles: Candle[];
}
