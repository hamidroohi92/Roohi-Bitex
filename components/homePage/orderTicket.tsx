"use client";

import { useEffect, useState, useRef } from "react";
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

  // Refs for keyboard navigation
  const buyButtonRef = useRef<HTMLButtonElement>(null);
  const sellButtonRef = useRef<HTMLButtonElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const costInputRef = useRef<HTMLInputElement>(null);
  const placeOrderButtonRef = useRef<HTMLButtonElement>(null);

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

      let pnl = 0;

      if (ticket.side === "buy") {
        // For BUY orders: profit when price goes up, loss when price goes down
        // Calculate PnL for price going UP 0.5%
        const priceUp = estimatedFillPrice + priceChange;
        pnl = (priceUp - estimatedFillPrice) * ticket.quantity;
      } else {
        // For SELL orders: profit when price goes down, loss when price goes up
        // Calculate PnL for price going DOWN 0.5%
        const priceDown = estimatedFillPrice - priceChange;
        pnl = (estimatedFillPrice - priceDown) * ticket.quantity;
      }

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

  // Keyboard event handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab navigation is handled automatically by browser
    // Add custom keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          buyButtonRef.current?.focus();
          handleSideChange("buy");
          break;
        case "s":
          e.preventDefault();
          sellButtonRef.current?.focus();
          handleSideChange("sell");
          break;
        case "Enter":
          e.preventDefault();
          if (ticket.isValid) {
            handlePlaceOrder();
          }
          break;
      }
    }

    // Arrow keys for side selection
    if (e.key === "ArrowLeft" && sellButtonRef.current) {
      e.preventDefault();
      buyButtonRef.current?.focus();
      handleSideChange("buy");
    }
    if (e.key === "ArrowRight" && buyButtonRef.current) {
      e.preventDefault();
      sellButtonRef.current?.focus();
      handleSideChange("sell");
    }
  };

  const formatQuantity = (value: number) => value.toFixed(6);

  return (
    <div
      className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4"
      onKeyDown={handleKeyDown}
      role="form"
      aria-label="Order ticket form"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Order Ticket
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Keyboard shortcuts: Ctrl+B (Buy), Ctrl+S (Sell), Arrow keys
          (navigate), Ctrl+Enter (place order)
        </p>
      </div>

      <div className="space-y-4">
        {/* Side Selection */}
        <fieldset>
          <legend className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
            Side
          </legend>
          <div
            className="grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Order side selection"
          >
            <button
              ref={buyButtonRef}
              onClick={() => handleSideChange("buy")}
              className={`py-2 px-4 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                ticket.side === "buy"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              role="radio"
              aria-checked={ticket.side === "buy"}
              aria-label="Buy order"
              tabIndex={ticket.side === "buy" ? 0 : -1}
            >
              BUY
            </button>
            <button
              ref={sellButtonRef}
              onClick={() => handleSideChange("sell")}
              className={`py-2 px-4 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                ticket.side === "sell"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              role="radio"
              aria-checked={ticket.side === "sell"}
              aria-label="Sell order"
              tabIndex={ticket.side === "sell" ? 0 : -1}
            >
              SELL
            </button>
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-4">
          {/* Quantity Input */}
          <div>
            <label
              htmlFor="quantity-input"
              className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300"
            >
              Quantity (BTC)
            </label>
            <input
              id="quantity-input"
              ref={quantityInputRef}
              type="number"
              step="0.000001"
              value={ticket.quantity || ""}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.000000"
              aria-describedby="quantity-help"
              aria-required="true"
            />
            <p
              id="quantity-help"
              className="text-xs text-gray-500 dark:text-gray-400 mt-1"
            >
              Enter quantity in BTC
            </p>
          </div>

          {/* Cost Input */}
          <div>
            <label
              htmlFor="cost-input"
              className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-300"
            >
              Cost (USD)
            </label>
            <input
              id="cost-input"
              ref={costInputRef}
              type="number"
              step="0.01"
              value={ticket.cost || ""}
              onChange={(e) => handleCostChange(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              aria-describedby="cost-help"
              aria-required="true"
            />
            <p
              id="cost-help"
              className="text-xs text-gray-500 dark:text-gray-400 mt-1"
            >
              Enter cost in USD
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Estimated Fill Price */}
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Estimated Fill Price
            </div>
            <div className="text-gray-900 dark:text-white font-medium text-lg">
              {formatCurrency(estimatedFillPrice)}
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
              {ticket.estimatedPnL >= 0 ? "+" : ""}
              {formatCurrency(ticket.estimatedPnL)}
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          ref={placeOrderButtonRef}
          onClick={handlePlaceOrder}
          disabled={!ticket.isValid}
          className={`w-full py-3 px-4 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            ticket.isValid
              ? ticket.side === "buy"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
          aria-describedby={!ticket.isValid ? "error-message" : undefined}
          aria-label={
            ticket.isValid
              ? `Place ${ticket.side} order`
              : "Order button disabled"
          }
        >
          {ticket.isValid
            ? `Place ${ticket.side.toUpperCase()} Order`
            : ticket.errorMessage}
        </button>

        {!ticket.isValid && (
          <p
            id="error-message"
            className="text-sm text-red-600 dark:text-red-400 mt-2"
            role="alert"
            aria-live="polite"
          >
            {ticket.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
