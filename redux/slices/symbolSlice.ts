import { SymbolState } from "@/types/state";
import { createSlice } from "@reduxjs/toolkit";

const initialState: SymbolState = {
  symbol: "BTCUSDT",
  currentPrice: 0,
  candles: [],
};

const symbolSlice = createSlice({
  name: "symbol",
  initialState,
  reducers: {
    setCurrentPrice: (state, action) => {
      state.currentPrice = action.payload;
    },
    setCandles: (state, action) => {
      state.candles = action.payload;
    },
  },
});

export const { setCurrentPrice, setCandles } = symbolSlice.actions;
export default symbolSlice.reducer;
