import { AppState, ConnectionStatus } from "@/types/state";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AppState = {
  isLoading: false,
  darkMode: false,
  socketStatus: {
    orderBook: "disconnected",
    trade: "disconnected",
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
  },
});

export const { setIsLoading, setDarkMode, setSocketStatus } = appSlice.actions;
export default appSlice.reducer;
