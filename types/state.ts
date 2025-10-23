import {
  Candle,
  OrderBookData,
  OrderTicketState as OrderTicketData,
  SimulatedBalance,
} from "./trade";

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

export interface OrderTicketState {
  ticket: OrderTicketData;
  balance: SimulatedBalance;
}

export interface RootState {
  app: AppState;
  symbol: SymbolState;
  orderBook: OrderBookState;
  orderTicket: OrderTicketState;
}
