"use client";

import { useState, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "@/types/state";
import { OrderSide } from "@/types/trade";
import { updateBalance } from "@/redux/slices/orderTicketSlice";
import { formatCurrency } from "@/utils";

export default function OrderTicket() {
  const dispatch = useDispatch();
  const { balance } = useSelector((state: RootState) => state.orderTicket);
  const { data: orderBookData } = useSelector(
    (state: RootState) => state.orderBook
  );

  // Local state for form inputs
  const [side, setSide] = useState<OrderSide>("buy");
  const [quantity, setQuantity] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [focusedInput, setFocusedInput] = useState<"quantity" | "cost" | null>(
    null
  );

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
  const currentEstimatedFillPrice = side === "buy" ? bestAsk : bestBid;

  // Computed values using useMemo with focus-aware logic
  const computedCost = useMemo(() => {
    if (
      focusedInput === "quantity" &&
      quantity > 0 &&
      currentEstimatedFillPrice > 0
    ) {
      return quantity * currentEstimatedFillPrice;
    } else if (focusedInput === "cost") {
      return cost;
    } else if (quantity > 0 && currentEstimatedFillPrice > 0) {
      return quantity * currentEstimatedFillPrice;
    }
    return cost;
  }, [quantity, currentEstimatedFillPrice, cost, focusedInput]);

  const computedQuantity = useMemo(() => {
    if (focusedInput === "cost" && cost > 0 && currentEstimatedFillPrice > 0) {
      return cost / currentEstimatedFillPrice;
    } else if (focusedInput === "quantity") {
      return quantity;
    } else if (cost > 0 && currentEstimatedFillPrice > 0) {
      return cost / currentEstimatedFillPrice;
    }
    return quantity;
  }, [quantity, cost, currentEstimatedFillPrice, focusedInput]);

  const computedEstimatedPnL = useMemo(() => {
    const activeQuantity =
      focusedInput === "quantity" ? quantity : computedQuantity;
    if (activeQuantity > 0 && currentEstimatedFillPrice > 0) {
      const priceChange = currentEstimatedFillPrice * 0.005; // 0.5%

      if (side === "buy") {
        // For BUY orders: profit when price goes up, loss when price goes down
        // Calculate PnL for price going UP 0.5%
        const priceUp = currentEstimatedFillPrice + priceChange;
        return (priceUp - currentEstimatedFillPrice) * activeQuantity;
      } else {
        // For SELL orders: profit when price goes down, loss when price goes up
        // Calculate PnL for price going DOWN 0.5%
        const priceDown = currentEstimatedFillPrice - priceChange;
        return (currentEstimatedFillPrice - priceDown) * activeQuantity;
      }
    }
    return 0;
  }, [
    quantity,
    computedQuantity,
    currentEstimatedFillPrice,
    side,
    focusedInput,
  ]);

  const validation = useMemo(() => {
    let newIsValid = true;
    let newErrorMessage = "";

    const activeQuantity =
      focusedInput === "quantity" ? quantity : computedQuantity;
    const activeCost = focusedInput === "cost" ? cost : computedCost;

    if (activeQuantity <= 0) {
      newIsValid = false;
      newErrorMessage = "Quantity must be greater than 0";
    } else if (side === "buy" && activeCost > balance.usd) {
      newIsValid = false;
      newErrorMessage = `Insufficient USD balance. Required: $${activeCost.toFixed(
        2
      )}, Available: $${balance.usd.toFixed(2)}`;
    } else if (side === "sell" && activeQuantity > balance.btc) {
      newIsValid = false;
      newErrorMessage = `Insufficient BTC balance. Required: ${activeQuantity.toFixed(
        6
      )}, Available: ${balance.btc.toFixed(6)}`;
    }

    return { isValid: newIsValid, errorMessage: newErrorMessage };
  }, [
    quantity,
    computedQuantity,
    cost,
    computedCost,
    side,
    balance,
    focusedInput,
  ]);

  const handleSideChange = (newSide: OrderSide) => {
    setSide(newSide);
  };

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseFloat(value) || 0;
    setQuantity(newQuantity);
    // Update cost when quantity changes and we're focused on quantity
    if (newQuantity > 0 && currentEstimatedFillPrice > 0) {
      setCost(newQuantity * currentEstimatedFillPrice);
    }
  };

  const handleCostChange = (value: string) => {
    const newCost = parseFloat(value) || 0;
    setCost(newCost);
    // Update quantity when cost changes and we're focused on cost
    if (currentEstimatedFillPrice > 0) {
      const newQuantity = newCost / currentEstimatedFillPrice;
      setQuantity(newQuantity);
    }
  };

  const handleQuantityFocus = () => {
    setFocusedInput("quantity");
  };

  const handleCostFocus = () => {
    setFocusedInput("cost");
  };

  const handleQuantityBlur = () => {
    // Keep focus state for a short time to allow price updates to affect cost
    setTimeout(() => {
      if (focusedInput === "quantity") {
        setFocusedInput(null);
      }
    }, 100);
  };

  const handleCostBlur = () => {
    // Keep focus state for a short time to allow price updates to affect quantity
    setTimeout(() => {
      if (focusedInput === "cost") {
        setFocusedInput(null);
      }
    }, 100);
  };

  const handlePlaceOrder = () => {
    if (!validation.isValid) return;

    // Use computed values for order execution
    const activeQuantity =
      focusedInput === "quantity" ? quantity : computedQuantity;
    const activeCost = focusedInput === "cost" ? cost : computedCost;

    // Simulate order execution
    const newBalance = { ...balance };
    if (side === "buy") {
      newBalance.usd -= activeCost;
      newBalance.btc += activeQuantity;
    } else {
      newBalance.usd += activeCost;
      newBalance.btc -= activeQuantity;
    }

    dispatch(updateBalance(newBalance));

    // Reset form
    setQuantity(0);
    setCost(0);
    setFocusedInput(null);

    // Show success toast notification
    toast.success(
      `Order placed successfully! ${side.toUpperCase()} ${activeQuantity.toFixed(
        6
      )} BTC at $${currentEstimatedFillPrice.toFixed(2)}`,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      }
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
          if (validation.isValid) {
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
                side === "buy"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              role="radio"
              aria-checked={side === "buy"}
              aria-label="Buy order"
              tabIndex={side === "buy" ? 0 : -1}
            >
              BUY
            </button>
            <button
              ref={sellButtonRef}
              onClick={() => handleSideChange("sell")}
              className={`py-2 px-4 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                side === "sell"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              role="radio"
              aria-checked={side === "sell"}
              aria-label="Sell order"
              tabIndex={side === "sell" ? 0 : -1}
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
              value={focusedInput === "quantity" ? quantity : computedQuantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              onFocus={handleQuantityFocus}
              onBlur={handleQuantityBlur}
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
              value={focusedInput === "cost" ? cost : computedCost}
              onChange={(e) => handleCostChange(e.target.value)}
              onFocus={handleCostFocus}
              onBlur={handleCostBlur}
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
              {formatCurrency(currentEstimatedFillPrice)}
            </div>
          </div>

          {/* Estimated PnL */}
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Estimated PnL (±0.5%)
            </div>
            <div
              className={`font-medium text-lg ${
                computedEstimatedPnL >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {computedEstimatedPnL >= 0 ? "+" : ""}
              {formatCurrency(computedEstimatedPnL)}
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          ref={placeOrderButtonRef}
          onClick={handlePlaceOrder}
          disabled={!validation.isValid}
          className={`w-full py-3 px-4 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            validation.isValid
              ? side === "buy"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
          aria-describedby={!validation.isValid ? "error-message" : undefined}
          aria-label={
            validation.isValid ? `Place ${side} order` : "Order button disabled"
          }
        >
          {validation.isValid
            ? `Place ${side.toUpperCase()} Order`
            : validation.errorMessage}
        </button>

        {!validation.isValid && (
          <p
            id="error-message"
            className="text-sm text-red-600 dark:text-red-400 mt-2"
            role="alert"
            aria-live="polite"
          >
            {validation.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
