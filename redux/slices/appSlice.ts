import { AppState } from "@/types/state";
import { createSlice } from "@reduxjs/toolkit";

const initialState: AppState = {
  isLoading: false,
  darkMode: false,
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
  },
});

export const { setIsLoading, setDarkMode } = appSlice.actions;
export default appSlice.reducer;
