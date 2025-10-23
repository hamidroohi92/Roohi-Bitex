"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/types/state";
import { OrderSide } from "@/types/trade";
import {
  setSide,
  setQuantity,
  setCost,
  setTotal,
  setEstimatedFillPrice,
  setEstimatedPnL,
  setValidation,
  updateBalance,
  resetTicket,
} from "@/redux/slices/orderTicketSlice";
import { formatCurrency } from "@/utils";

export default function OrderTicket() {
  const dispatch = useDispatch();
  const { ticket, balance } = useSelector(
    (state: RootState) => state.orderTicket
  );
  const { data: orderBookData } = useSelector(
    (state: RootState) => state.orderBook
  );
  const [inputMode, setInputMode] = useState<"quantity" | "cost">("quantity");

  // Get best bid/ask prices from order book
  const bestBid = orderBookData.bids[0]?.price || 0;
  const bestAsk = orderBookData.asks[0]?.price || 0;

  // Calculate estimated fill price based on side
  const estimatedFillPrice = ticket.side === "buy" ? bestAsk : bestBid;

  // Auto-calculate cost/total when quantity or price changes
  useEffect(() => {
    if (ticket.quantity > 0 && estimatedFillPrice > 0) {
      const cost = ticket.quantity * estimatedFillPrice;
      dispatch(setCost(cost));
      dispatch(setTotal(cost));
    }
  }, [ticket.quantity, estimatedFillPrice, dispatch]);

  // Calculate estimated PnL for ±0.5% price movement
  useEffect(() => {
    if (ticket.quantity > 0 && estimatedFillPrice > 0) {
      const priceChange = estimatedFillPrice * 0.005; // 0.5%
      const newPrice = estimatedFillPrice + priceChange;
      const pnl =
        ticket.side === "buy"
          ? (newPrice - estimatedFillPrice) * ticket.quantity
          : (estimatedFillPrice - newPrice) * ticket.quantity;
      dispatch(setEstimatedPnL(pnl));
    }
  }, [ticket.quantity, estimatedFillPrice, ticket.side, dispatch]);

  // Update estimated fill price
  useEffect(() => {
    dispatch(setEstimatedFillPrice(estimatedFillPrice));
  }, [estimatedFillPrice, dispatch]);

  // Risk validation
  useEffect(() => {
    let isValid = true;
    let errorMessage = "";

    if (ticket.quantity <= 0) {
      isValid = false;
      errorMessage = "Quantity must be greater than 0";
    } else if (ticket.side === "buy" && ticket.cost > balance.usd) {
      isValid = false;
      errorMessage = `Insufficient USD balance. Required: $${ticket.cost.toFixed(
        2
      )}, Available: $${balance.usd.toFixed(2)}`;
    } else if (ticket.side === "sell" && ticket.quantity > balance.btc) {
      isValid = false;
      errorMessage = `Insufficient BTC balance. Required: ${ticket.quantity.toFixed(
        6
      )}, Available: ${balance.btc.toFixed(6)}`;
    }

    dispatch(setValidation({ isValid, errorMessage }));
  }, [ticket.quantity, ticket.cost, ticket.side, balance, dispatch]);

  const handleSideChange = (side: OrderSide) => {
    dispatch(setSide(side));
  };

  const handleQuantityChange = (value: string) => {
    const quantity = parseFloat(value) || 0;
    dispatch(setQuantity(quantity));
  };

  const handleCostChange = (value: string) => {
    const cost = parseFloat(value) || 0;
    dispatch(setCost(cost));
    if (estimatedFillPrice > 0) {
      const quantity = cost / estimatedFillPrice;
      dispatch(setQuantity(quantity));
    }
  };

  const handlePlaceOrder = () => {
    if (!ticket.isValid) return;

    // Simulate order execution
    const newBalance = { ...balance };
    if (ticket.side === "buy") {
      newBalance.usd -= ticket.cost;
      newBalance.btc += ticket.quantity;
    } else {
      newBalance.usd += ticket.cost;
      newBalance.btc -= ticket.quantity;
    }

    dispatch(updateBalance(newBalance));
    dispatch(resetTicket());

    // Show success message (in real app, this would be handled by a notification system)
    alert(
      `Order placed successfully! ${ticket.side.toUpperCase()} ${ticket.quantity.toFixed(
        6
      )} BTC at $${estimatedFillPrice.toFixed(2)}`
    );
  };

  const formatQuantity = (value: number) => value.toFixed(6);

  return (
    <div className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Order Ticket
        </h2>
      </div>

      <div className="space-y-4">
        {/* Side Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
            Side
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSideChange("buy")}
              className={`py-2 px-4 rounded font-medium transition-colors ${
                ticket.side === "buy"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => handleSideChange("sell")}
              className={`py-2 px-4 rounded font-medium transition-colors ${
                ticket.side === "sell"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
              Quantity (BTC)
            </label>
            <input
              type="number"
              step="0.000001"
              value={ticket.quantity || ""}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              placeholder="0.000000"
            />
          </div>

          {/* Cost Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
              Cost (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={ticket.cost || ""}
              onChange={(e) => handleCostChange(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Estimated Fill Price */}
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Estimated Fill Price
            </div>
            <div className="text-gray-900 dark:text-white font-medium text-lg">
              ${formatCurrency(estimatedFillPrice)}
            </div>
          </div>

          {/* Estimated PnL */}
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Estimated PnL (±0.5%)
            </div>
            <div
              className={`font-medium text-lg ${
                ticket.estimatedPnL >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {ticket.estimatedPnL >= 0 ? "+" : ""}$
              {formatCurrency(ticket.estimatedPnL)}
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={!ticket.isValid}
          className={`w-full py-3 px-4 rounded font-medium transition-colors ${
            ticket.isValid
              ? ticket.side === "buy"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          {ticket.isValid
            ? `Place ${ticket.side.toUpperCase()} Order`
            : ticket.errorMessage}
        </button>
      </div>
    </div>
  );
}
