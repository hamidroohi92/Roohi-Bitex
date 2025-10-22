import appReducer from "./slices/appSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

const reducers = combineReducers({
  app: appReducer,
});

export const store = configureStore({
  reducer: reducers,
});
