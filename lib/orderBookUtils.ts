import { OrderBookLevel, OrderBookData } from "@/types/trade";

export const calculateSpread = (
  bids: OrderBookLevel[],
  asks: OrderBookLevel[]
): number => {
  const bestBid = bids[0]?.price || 0;
  const bestAsk = asks[0]?.price || 0;
  return bestAsk - bestBid;
};

export const calculateMidPrice = (
  bids: OrderBookLevel[],
  asks: OrderBookLevel[]
): number => {
  const bestBid = bids[0]?.price || 0;
  const bestAsk = asks[0]?.price || 0;
  return (bestBid + bestAsk) / 2;
};

export const calculateVWAP = (levels: OrderBookLevel[]): number => {
  if (levels.length === 0) return 0;

  const totalVolume = levels.reduce((sum, level) => sum + level.quantity, 0);
  const weightedPrice = levels.reduce(
    (sum, level) => sum + level.price * level.quantity,
    0
  );

  return totalVolume > 0 ? weightedPrice / totalVolume : 0;
};

export const formatOrderBookData = (data: OrderBookData) => {
  return {
    ...data,
    spread: parseFloat(data.spread.toFixed(2)),
    midPrice: parseFloat(data.midPrice.toFixed(2)),
    vwap: parseFloat(data.vwap.toFixed(2)),
  };
};

export const validateOrderBookSequence = (
  currentId: number,
  newId: number
): boolean => {
  return newId === currentId + 1;
};

export const sortBids = (bids: OrderBookLevel[]): OrderBookLevel[] => {
  return [...bids].sort((a, b) => b.price - a.price);
};

export const sortAsks = (asks: OrderBookLevel[]): OrderBookLevel[] => {
  return [...asks].sort((a, b) => a.price - b.price);
};
