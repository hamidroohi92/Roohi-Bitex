import { combineReducers, configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import symbolReducer from "./slices/symbolSlice";
import orderBookReducer from "./slices/orderBookSlice";

const reducers = combineReducers({
  app: appReducer,
  symbol: symbolReducer,
  orderBook: orderBookReducer,
});

export const store = configureStore({
  reducer: reducers,
});
