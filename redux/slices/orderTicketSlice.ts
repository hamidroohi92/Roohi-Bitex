import {
  OrderTicketState,
  OrderTicketData,
  SimulatedBalance,
} from "@/types/state";
import { OrderSide } from "@/types/trade";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialTicketData: OrderTicketData = {
  side: "buy",
  quantity: 0,
  cost: 0,
  total: 0,
  estimatedFillPrice: 0,
  estimatedPnL: 0,
  isValid: false,
  errorMessage: "",
};

const initialBalance: SimulatedBalance = {
  usd: 10000,
  btc: 0.25,
};

const initialState: OrderTicketState = {
  ticket: initialTicketData,
  balance: initialBalance,
};

const orderTicketSlice = createSlice({
  name: "orderTicket",
  initialState,
  reducers: {
    setSide: (state, action: PayloadAction<OrderSide>) => {
      state.ticket.side = action.payload;
      state.ticket.errorMessage = "";
    },
    setQuantity: (state, action: PayloadAction<number>) => {
      state.ticket.quantity = action.payload;
      state.ticket.errorMessage = "";
    },
    setCost: (state, action: PayloadAction<number>) => {
      state.ticket.cost = action.payload;
      state.ticket.errorMessage = "";
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.ticket.total = action.payload;
      state.ticket.errorMessage = "";
    },
    setEstimatedFillPrice: (state, action: PayloadAction<number>) => {
      state.ticket.estimatedFillPrice = action.payload;
    },
    setEstimatedPnL: (state, action: PayloadAction<number>) => {
      state.ticket.estimatedPnL = action.payload;
    },
    setValidation: (
      state,
      action: PayloadAction<{ isValid: boolean; errorMessage: string }>
    ) => {
      state.ticket.isValid = action.payload.isValid;
      state.ticket.errorMessage = action.payload.errorMessage;
    },
    updateBalance: (state, action: PayloadAction<SimulatedBalance>) => {
      state.balance = action.payload;
    },
    resetTicket: (state) => {
      state.ticket = initialTicketData;
    },
  },
});

export const {
  setSide,
  setQuantity,
  setCost,
  setTotal,
  setEstimatedFillPrice,
  setEstimatedPnL,
  setValidation,
  updateBalance,
  resetTicket,
} = orderTicketSlice.actions;

export default orderTicketSlice.reducer;
