import {
  Candle,
  OrderBookData,
  OrderTicketState as OrderTicketData,
  SimulatedBalance,
} from "./trade";

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export interface SocketStatus {
  orderBook: ConnectionStatus;
  trade: ConnectionStatus;
}

export interface LatencyInfo {
  orderBook: number; // milliseconds
  trade: number; // milliseconds
  lastUpdate: number; // timestamp
}

export interface AppState {
  isLoading: boolean;
  darkMode: boolean;
  socketStatus: SocketStatus;
  latency: LatencyInfo;
}

export interface SymbolState {
  symbol: string;
  currentPrice: number;
  candles: Candle[];
}

export interface LevelUpdate {
  price: number;
  isBid: boolean;
  direction: "up" | "down";
  timestamp: number;
}

export interface OrderBookState {
  data: OrderBookData;
  isConnected: boolean;
  lastUpdateId: number;
  isInitialized: boolean;
  levelUpdates: LevelUpdate[];
}

export interface OrderTicketState {
  balance: SimulatedBalance;
}

export interface RootState {
  app: AppState;
  symbol: SymbolState;
  orderBook: OrderBookState;
  orderTicket: OrderTicketState;
}
