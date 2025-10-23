export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  cumulative?: number;
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdateId: number;
  spread: number;
  midPrice: number;
  vwap: number;
}

export interface OrderBookUpdate {
  e: string; // event type
  E: number; // event time
  s: string; // symbol
  U: number; // first update id in event
  u: number; // final update id in event
  b: [string, string][]; // bids
  a: [string, string][]; // asks
}

export type OrderSide = "buy" | "sell";

export interface OrderTicketState {
  side: OrderSide;
  quantity: number;
  cost: number;
  total: number;
  estimatedFillPrice: number;
  estimatedPnL: number;
  isValid: boolean;
  errorMessage: string;
}

export interface SimulatedBalance {
  usd: number;
  btc: number;
}
