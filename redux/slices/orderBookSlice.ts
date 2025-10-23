import { OrderBookState, LevelUpdate } from "@/types/state";
import { OrderBookData, OrderBookLevel, OrderBookUpdate } from "@/types/trade";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialOrderBookData: OrderBookData = {
  bids: [],
  asks: [],
  lastUpdateId: 0,
  spread: 0,
  midPrice: 0,
  vwap: 0,
};

const initialState: OrderBookState = {
  data: initialOrderBookData,
  isConnected: false,
  lastUpdateId: 0,
  isInitialized: false,
  levelUpdates: [],
};

const orderBookSlice = createSlice({
  name: "orderBook",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setLastUpdateId: (state, action: PayloadAction<number>) => {
      state.lastUpdateId = action.payload;
    },
    clearLevelUpdates: (state) => {
      state.levelUpdates = [];
    },
    updateOrderBook: (state, action: PayloadAction<OrderBookData>) => {
      state.data = action.payload;
    },
    initializeOrderBook: (
      state,
      action: PayloadAction<{
        bids: [string, string][];
        asks: [string, string][];
        lastUpdateId: number;
      }>
    ) => {
      const { bids, asks, lastUpdateId } = action.payload;

      // Convert string arrays to OrderBookLevel objects
      const formattedBids: OrderBookLevel[] = bids
        .map(([price, quantity]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
        }))
        .sort((a, b) => b.price - a.price) // Sort bids descending
        .slice(0, 20); // Top 20

      const formattedAsks: OrderBookLevel[] = asks
        .map(([price, quantity]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
        }))
        .sort((a, b) => a.price - b.price) // Sort asks ascending
        .slice(0, 20); // Top 20

      // Calculate cumulative sizes
      let cumulativeBid = 0;
      const bidsWithCumulative = formattedBids.map((level) => {
        cumulativeBid += level.quantity;
        return { ...level, cumulative: cumulativeBid };
      });

      let cumulativeAsk = 0;
      const asksWithCumulative = formattedAsks.map((level) => {
        cumulativeAsk += level.quantity;
        return { ...level, cumulative: cumulativeAsk };
      });

      // Calculate spread, mid-price, and VWAP
      const bestBid = formattedBids[0]?.price || 0;
      const bestAsk = formattedAsks[0]?.price || 0;
      const spread = bestAsk - bestBid;
      const midPrice = (bestBid + bestAsk) / 2;

      // Calculate VWAP for top 20 levels
      const top20Bids = formattedBids.slice(0, 20);
      const top20Asks = formattedAsks.slice(0, 20);
      const allLevels = [...top20Bids, ...top20Asks];

      const totalVolume = allLevels.reduce(
        (sum, level) => sum + level.quantity,
        0
      );
      const weightedPrice = allLevels.reduce(
        (sum, level) => sum + level.price * level.quantity,
        0
      );
      const vwap = totalVolume > 0 ? weightedPrice / totalVolume : 0;

      state.data = {
        bids: bidsWithCumulative,
        asks: asksWithCumulative,
        lastUpdateId,
        spread,
        midPrice,
        vwap,
      };
      state.lastUpdateId = lastUpdateId;
      state.isInitialized = true;
    },
    applyOrderBookUpdate: (state, action: PayloadAction<OrderBookUpdate>) => {
      const update = action.payload;

      // Sequence check
      if (update.U !== state.lastUpdateId + 1) {
        //skip if the update is not the next update
        return;
      }

      // Store previous levels for comparison
      const previousBidMap = new Map(
        state.data.bids.map((level) => [level.price, level.quantity])
      );
      const previousAskMap = new Map(
        state.data.asks.map((level) => [level.price, level.quantity])
      );

      // Apply bid updates
      const bidMap = new Map(
        state.data.bids.map((level) => [level.price, level])
      );
      update.b.forEach(([price, quantity]) => {
        const priceNum = parseFloat(price);
        const quantityNum = parseFloat(quantity);

        if (quantityNum === 0) {
          bidMap.delete(priceNum);
        } else {
          bidMap.set(priceNum, { price: priceNum, quantity: quantityNum });
        }
      });

      // Apply ask updates
      const askMap = new Map(
        state.data.asks.map((level) => [level.price, level])
      );
      update.a.forEach(([price, quantity]) => {
        const priceNum = parseFloat(price);
        const quantityNum = parseFloat(quantity);

        if (quantityNum === 0) {
          askMap.delete(priceNum);
        } else {
          askMap.set(priceNum, { price: priceNum, quantity: quantityNum });
        }
      });

      // Convert back to arrays and sort
      const updatedBids = Array.from(bidMap.values())
        .sort((a, b) => b.price - a.price)
        .slice(0, 20);

      const updatedAsks = Array.from(askMap.values())
        .sort((a, b) => a.price - b.price)
        .slice(0, 20);

      // Track level changes for color-tick animation
      const newLevelUpdates: LevelUpdate[] = [];
      const currentTime = Date.now();

      // Get previous best prices for comparison
      const previousBestBid = state.data.bids[0]?.price || 0;
      const previousBestAsk = state.data.asks[0]?.price || 0;

      // Check bid changes - for bids, more quantity is better (green), less quantity is worse (red)
      updatedBids.forEach((level) => {
        const previousQuantity = previousBidMap.get(level.price) || 0;
        if (previousQuantity !== level.quantity) {
          // For bids: quantity increase = more buying pressure (green), quantity decrease = less buying pressure (red)
          const direction = level.quantity > previousQuantity ? "up" : "down";
          newLevelUpdates.push({
            price: level.price,
            isBid: true,
            direction,
            timestamp: currentTime,
          });
        }
      });

      // Check ask changes - for asks, less quantity is better (green), more quantity is worse (red)
      updatedAsks.forEach((level) => {
        const previousQuantity = previousAskMap.get(level.price) || 0;
        if (previousQuantity !== level.quantity) {
          // For asks: quantity decrease = less selling pressure (green), quantity increase = more selling pressure (red)
          const direction = level.quantity < previousQuantity ? "up" : "down";
          newLevelUpdates.push({
            price: level.price,
            isBid: false,
            direction,
            timestamp: currentTime,
          });
        }
      });

      // Check for removed levels (quantity became 0)
      previousBidMap.forEach((quantity, price) => {
        if (quantity > 0 && !bidMap.has(price)) {
          newLevelUpdates.push({
            price,
            isBid: true,
            direction: "down",
            timestamp: currentTime,
          });
        }
      });

      previousAskMap.forEach((quantity, price) => {
        if (quantity > 0 && !askMap.has(price)) {
          newLevelUpdates.push({
            price,
            isBid: false,
            direction: "down",
            timestamp: currentTime,
          });
        }
      });

      // Recalculate cumulative sizes
      let cumulativeBid = 0;
      const bidsWithCumulative = updatedBids.map((level) => {
        cumulativeBid += level.quantity;
        return { ...level, cumulative: cumulativeBid };
      });

      let cumulativeAsk = 0;
      const asksWithCumulative = updatedAsks.map((level) => {
        cumulativeAsk += level.quantity;
        return { ...level, cumulative: cumulativeAsk };
      });

      // Recalculate spread, mid-price, and VWAP
      const bestBid = updatedBids[0]?.price || 0;
      const bestAsk = updatedAsks[0]?.price || 0;
      const spread = bestAsk - bestBid;
      const midPrice = (bestBid + bestAsk) / 2;

      const top20Bids = updatedBids.slice(0, 20);
      const top20Asks = updatedAsks.slice(0, 20);
      const allLevels = [...top20Bids, ...top20Asks];

      const totalVolume = allLevels.reduce(
        (sum, level) => sum + level.quantity,
        0
      );
      const weightedPrice = allLevels.reduce(
        (sum, level) => sum + level.price * level.quantity,
        0
      );
      const vwap = totalVolume > 0 ? weightedPrice / totalVolume : 0;

      state.data = {
        bids: bidsWithCumulative,
        asks: asksWithCumulative,
        lastUpdateId: update.u,
        spread,
        midPrice,
        vwap,
      };
      state.lastUpdateId = update.u;

      // Add new level updates and clean up old ones (older than 2 seconds)
      const twoSecondsAgo = currentTime - 2000;
      state.levelUpdates = [
        ...state.levelUpdates.filter(
          (update) => update.timestamp > twoSecondsAgo
        ),
        ...newLevelUpdates,
      ];
    },
  },
});

export const {
  setConnected,
  setInitialized,
  setLastUpdateId,
  clearLevelUpdates,
  updateOrderBook,
  initializeOrderBook,
  applyOrderBookUpdate,
} = orderBookSlice.actions;

export default orderBookSlice.reducer;
