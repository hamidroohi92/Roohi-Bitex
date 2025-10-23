import { Candle, OrderBookData } from "./trade";

export interface AppState {
  isLoading: boolean;
  darkMode: boolean;
}

export interface SymbolState {
  symbol: string;
  currentPrice: number;
  candles: Candle[];
}

export interface OrderBookState {
  data: OrderBookData;
  isConnected: boolean;
  lastUpdateId: number;
  isInitialized: boolean;
}

export interface RootState {
  app: AppState;
  symbol: SymbolState;
  orderBook: OrderBookState;
}
