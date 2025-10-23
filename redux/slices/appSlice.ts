import { AppState, ConnectionStatus } from "@/types/state";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AppState = {
  isLoading: false,
  darkMode: false,
  socketStatus: {
    orderBook: "disconnected",
    trade: "disconnected",
  },
  latency: {
    orderBook: 0,
    trade: 0,
    lastUpdate: 0,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
    setSocketStatus: (
      state,
      action: PayloadAction<{
        socket: "orderBook" | "trade";
        status: ConnectionStatus;
      }>
    ) => {
      state.socketStatus[action.payload.socket] = action.payload.status;
    },
    setLatency: (
      state,
      action: PayloadAction<{
        socket: "orderBook" | "trade";
        latency: number;
      }>
    ) => {
      state.latency[action.payload.socket] = action.payload.latency;
      state.latency.lastUpdate = Date.now();
    },
  },
});

export const { setIsLoading, setDarkMode, setSocketStatus, setLatency } =
  appSlice.actions;
export default appSlice.reducer;
