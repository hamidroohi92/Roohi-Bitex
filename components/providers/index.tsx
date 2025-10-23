"use client";

import { store } from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";

//providers component for the whole app
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
