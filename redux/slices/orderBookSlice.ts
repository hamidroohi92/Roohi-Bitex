import { OrderBookState } from "@/types/state";
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
    },
  },
});

export const {
  setConnected,
  setInitialized,
  setLastUpdateId,
  updateOrderBook,
  initializeOrderBook,
  applyOrderBookUpdate,
} = orderBookSlice.actions;

export default orderBookSlice.reducer;
