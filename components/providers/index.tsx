"use client";

import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { ThemeProvider } from "./themeContext";

//providers component for the whole app
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
