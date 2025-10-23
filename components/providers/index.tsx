"use client";

import { store } from "@/redux/store";
import { Provider } from "react-redux";

//providers component for the whole app
export default function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
