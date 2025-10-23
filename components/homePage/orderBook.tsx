"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState, LevelUpdate } from "@/types/state";
import { orderBookService } from "@/lib/orderBook";
import { OrderBookLevel } from "@/types/trade";

interface OrderBookRowProps {
  level: OrderBookLevel;
  isBid: boolean;
  updateInfo?: LevelUpdate;
}

function OrderBookRow({ level, updateInfo }: OrderBookRowProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<
    "up" | "down" | null
  >(null);

  useEffect(() => {
    if (updateInfo && !isAnimating) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setAnimationDirection(updateInfo.direction);
        setIsAnimating(true);
      });

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [updateInfo, isAnimating]);

  const getAnimationClasses = () => {
    if (!isAnimating || !animationDirection) {
      return "hover:bg-gray-200/50 dark:hover:bg-gray-700/50";
    }

    // Green for increases (up), red for decreases (down)
    if (animationDirection === "up") {
      return "bg-green-500/20 text-green-100";
    } else {
      return "bg-red-500/20 text-red-100";
    }
  };

  return (
    <div
      className={`flex justify-between items-center py-1 px-2 text-sm transition-colors duration-1000 ${getAnimationClasses()}`}
    >
      <div className="flex-1 text-left">
        <span className="text-gray-700 dark:text-gray-300">
          {level.price.toFixed(2)}
        </span>
      </div>
      <div className="flex-1 text-center">
        <span className="text-gray-600 dark:text-gray-400">
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
  const { data, isConnected, levelUpdates } = useSelector(
    (state: RootState) => state.orderBook
  );
  const { symbol } = useSelector((state: RootState) => state.symbol);

  useEffect(() => {
    orderBookService.connect(symbol.toLowerCase());

    return () => {
      orderBookService.disconnect();
    };
  }, [symbol]);

  // Helper function to find level update info
  const findLevelUpdate = (
    price: number,
    isBid: boolean
  ): LevelUpdate | undefined => {
    return levelUpdates.find(
      (update) => update.price === price && update.isBid === isBid
    );
  };

  const formatPrice = (price: number) => price.toFixed(2);

  return (
    <div className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order Book
          </h2>
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Spread:</span>
            <span className="ml-1 text-gray-900 dark:text-white">
              {formatPrice(data.spread)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Mid:</span>
            <span className="ml-1 text-gray-900 dark:text-white">
              {formatPrice(data.midPrice)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">VWAP:</span>
            <span className="ml-1 text-gray-900 dark:text-white">
              {formatPrice(data.vwap)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Book Content */}
      <div className="flex flex-col h-full">
        {/* Column Headers */}
        <div className="bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Price</span>
            <span>Size</span>
            <span>Total</span>
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-red-600 dark:text-red-400 text-xs px-2 py-1 bg-red-100/50 dark:bg-red-900/20">
            SELL
          </div>
          {data.asks.slice(0, 20).map((level) => (
            <OrderBookRow
              key={`ask-${level.price}`}
              level={level}
              isBid={false}
              updateInfo={findLevelUpdate(level.price, false)}
            />
          ))}
        </div>

        {/* Mid Price Separator */}
        <div className="bg-gray-300 dark:bg-gray-700 border-y border-gray-400 dark:border-gray-600 px-2 py-1 text-center text-sm font-medium text-gray-900 dark:text-white">
          {formatPrice(data.midPrice)}
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-green-600 dark:text-green-400 text-xs px-2 py-1 bg-green-100/50 dark:bg-green-900/20">
            BUY
          </div>
          {data.bids.slice(0, 20).map((level) => (
            <OrderBookRow
              key={`bid-${level.price}`}
              level={level}
              isBid={true}
              updateInfo={findLevelUpdate(level.price, true)}
            />
          ))}
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-100/90 dark:bg-red-900/80 text-red-800 dark:text-red-100 px-3 py-2 rounded text-sm">
          Disconnected from order book feed
        </div>
      )}
    </div>
  );
}
