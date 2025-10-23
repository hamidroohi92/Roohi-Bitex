import { OrderBookUpdate } from "@/types/trade";
import { store } from "@/redux/store";
import {
  setConnected,
  initializeOrderBook,
  applyOrderBookUpdate,
} from "@/redux/slices/orderBookSlice";

class OrderBookService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isInitialized = false;

  connect(symbol: string = "btcusdt") {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@depth@100ms`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("Order book WebSocket connected");
        store.dispatch(setConnected(true));
        this.reconnectAttempts = 0;

        // Get initial snapshot
        this.getInitialSnapshot(symbol);
      };

      this.ws.onmessage = (event) => {
        try {
          const data: OrderBookUpdate = JSON.parse(event.data);
          this.handleOrderBookUpdate(data);
        } catch (error) {
          console.error("Error parsing order book data:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("Order book WebSocket disconnected");
        store.dispatch(setConnected(false));
        this.handleReconnect(symbol);
      };

      this.ws.onerror = (error) => {
        console.error("Order book WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create order book WebSocket:", error);
    }
  }

  private async getInitialSnapshot(symbol: string) {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=1000`
      );
      const data = await response.json();

      store.dispatch(
        initializeOrderBook({
          bids: data.bids,
          asks: data.asks,
          lastUpdateId: data.lastUpdateId,
        })
      );

      this.isInitialized = true;
      console.log("Order book initialized with snapshot");
    } catch (error) {
      console.error("Failed to get initial order book snapshot:", error);
    }
  }

  private handleOrderBookUpdate(update: OrderBookUpdate) {
    if (!this.isInitialized) {
      console.log("Order book not initialized, skipping update");
      return;
    }

    store.dispatch(applyOrderBookUpdate(update));
  }

  private handleReconnect(symbol: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect order book WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect(symbol);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error(
        "Max reconnection attempts reached for order book WebSocket"
      );
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      store.dispatch(setConnected(false));
      this.isInitialized = false;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const orderBookService = new OrderBookService();
