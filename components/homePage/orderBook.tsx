"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/types/state";
import { orderBookService } from "@/lib/orderBook";
import { OrderBookLevel } from "@/types/trade";

interface OrderBookRowProps {
  level: OrderBookLevel;
  isBid: boolean;
  isUpdating?: boolean;
}

function OrderBookRow({ level, isBid, isUpdating }: OrderBookRowProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isUpdating]);

  return (
    <div
      className={`flex justify-between items-center py-1 px-2 text-sm transition-colors duration-1000 ${
        isAnimating
          ? isBid
            ? "bg-green-500/20 text-green-100"
            : "bg-red-500/20 text-red-100"
          : "hover:bg-gray-700/50 dark:hover:bg-gray-600/50"
      }`}
    >
      <div className="flex-1 text-left">
        <span className="text-gray-300 dark:text-gray-300">
          {level.price.toFixed(2)}
        </span>
      </div>
      <div className="flex-1 text-center">
        <span className="text-gray-400 dark:text-gray-400">
          {level.quantity.toFixed(6)}
        </span>
      </div>
      <div className="flex-1 text-right">
        <span className="text-gray-500 dark:text-gray-500">
          {level.cumulative?.toFixed(6) || "0.000000"}
        </span>
      </div>
    </div>
  );
}

export default function OrderBook() {
  const dispatch = useDispatch();
  const { data, isConnected, isInitialized } = useSelector(
    (state: RootState) => state.orderBook
  );
  const { symbol } = useSelector((state: RootState) => state.symbol);
  const [updatingLevels, setUpdatingLevels] = useState<Set<string>>(new Set());

  useEffect(() => {
    orderBookService.connect(symbol.toLowerCase());

    return () => {
      orderBookService.disconnect();
    };
  }, [symbol]);

  // Simulate level updates for animation (in real implementation, this would be triggered by actual updates)
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        // Randomly select a level to animate
        const allLevels = [...data.bids, ...data.asks];
        if (allLevels.length > 0) {
          const randomLevel =
            allLevels[Math.floor(Math.random() * allLevels.length)];
          const levelKey = `${randomLevel.price}`;

          setUpdatingLevels((prev) => new Set([...prev, levelKey]));
          setTimeout(() => {
            setUpdatingLevels((prev) => {
              const newSet = new Set(prev);
              newSet.delete(levelKey);
              return newSet;
            });
          }, 1000);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isInitialized, data.bids, data.asks]);

  const formatPrice = (price: number) => price.toFixed(2);
  const formatQuantity = (quantity: number) => quantity.toFixed(6);
  const formatCumulative = (cumulative: number) => cumulative.toFixed(6);

  return (
    <div className="h-full bg-gray-900 dark:bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 dark:bg-gray-800 border-b border-gray-700 dark:border-gray-600 p-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-white">Order Book</h2>
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Spread:</span>
            <span className="ml-1 text-white">{formatPrice(data.spread)}</span>
          </div>
          <div>
            <span className="text-gray-400">Mid:</span>
            <span className="ml-1 text-white">
              {formatPrice(data.midPrice)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">VWAP:</span>
            <span className="ml-1 text-white">{formatPrice(data.vwap)}</span>
          </div>
        </div>
      </div>

      {/* Order Book Content */}
      <div className="flex flex-col h-full">
        {/* Column Headers */}
        <div className="bg-gray-800 border-b border-gray-700 px-2 py-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Price</span>
            <span>Size</span>
            <span>Total</span>
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-red-400 text-xs px-2 py-1 bg-red-900/20">
            SELL
          </div>
          {data.asks.slice(0, 20).map((level, index) => (
            <OrderBookRow
              key={`ask-${level.price}`}
              level={level}
              isBid={false}
              isUpdating={updatingLevels.has(`${level.price}`)}
            />
          ))}
        </div>

        {/* Mid Price Separator */}
        <div className="bg-gray-700 border-y border-gray-600 px-2 py-1 text-center text-sm font-medium">
          {formatPrice(data.midPrice)}
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-green-400 text-xs px-2 py-1 bg-green-900/20">
            BUY
          </div>
          {data.bids.slice(0, 20).map((level, index) => (
            <OrderBookRow
              key={`bid-${level.price}`}
              level={level}
              isBid={true}
              isUpdating={updatingLevels.has(`${level.price}`)}
            />
          ))}
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-900/80 text-red-100 px-3 py-2 rounded text-sm">
          Disconnected from order book feed
        </div>
      )}
    </div>
  );
}
