import { combineReducers, configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import symbolReducer from "./slices/symbolSlice";

const reducers = combineReducers({
  app: appReducer,
  symbol: symbolReducer,
});

export const store = configureStore({
  reducer: reducers,
});
