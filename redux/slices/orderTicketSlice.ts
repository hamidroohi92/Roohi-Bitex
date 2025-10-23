import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  loadBalanceFromStorage,
  saveBalanceToStorage,
} from "@/utils/localStorage";
import { SimulatedBalance } from "@/types/trade";

// Load balance from localStorage or use default
const getInitialBalance = (): SimulatedBalance => {
  const storedBalance = loadBalanceFromStorage();
  return (
    storedBalance || {
      usd: 10000,
      btc: 0.25,
    }
  );
};

const initialBalance: SimulatedBalance = getInitialBalance();

const initialState = {
  balance: initialBalance,
};

const orderTicketSlice = createSlice({
  name: "orderTicket",
  initialState,
  reducers: {
    updateBalance: (state, action: PayloadAction<SimulatedBalance>) => {
      state.balance = action.payload;
      // Save to localStorage whenever balance is updated
      saveBalanceToStorage(action.payload);
    },
  },
});

export const { updateBalance } = orderTicketSlice.actions;

export default orderTicketSlice.reducer;
