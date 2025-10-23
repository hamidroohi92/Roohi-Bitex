import { combineReducers, configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import symbolReducer from "./slices/symbolSlice";
import orderBookReducer from "./slices/orderBookSlice";
import orderTicketReducer from "./slices/orderTicketSlice";

const reducers = combineReducers({
  app: appReducer,
  symbol: symbolReducer,
  orderBook: orderBookReducer,
  orderTicket: orderTicketReducer,
});

export const store = configureStore({
  reducer: reducers,
});
