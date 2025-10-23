import { OrderBookUpdate } from "@/types/trade";
import { store } from "@/redux/store";
import {
  setConnected,
  initializeOrderBook,
  applyOrderBookUpdate,
} from "@/redux/slices/orderBookSlice";
import { setSocketStatus, setLatency } from "@/redux/slices/appSlice";

class OrderBookService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private isInitialized = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private currentSymbol: string = "btcusdt";

  connect(symbol: string = "btcusdt") {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.currentSymbol = symbol;
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@depth@100ms`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("Order book WebSocket connected");
        store.dispatch(setConnected(true));
        store.dispatch(
          setSocketStatus({ socket: "orderBook", status: "connected" })
        );
        this.reconnectAttempts = 0;

        // Get initial snapshot
        this.getInitialSnapshot(symbol);
      };

      this.ws.onmessage = (event) => {
        const messageTime = Date.now();
        try {
          const data: OrderBookUpdate = JSON.parse(event.data);
          this.handleOrderBookUpdate(data, messageTime);
        } catch (error) {
          console.log("Error parsing order book data:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("Order book WebSocket disconnected");
        store.dispatch(setConnected(false));
        store.dispatch(
          setSocketStatus({ socket: "orderBook", status: "disconnected" })
        );
        this.handleReconnect(symbol);
      };

      this.ws.onerror = (error) => {
        console.log("Order book WebSocket error:", error);
        store.dispatch(
          setSocketStatus({ socket: "orderBook", status: "disconnected" })
        );
      };
    } catch (error) {
      console.log("Failed to create order book WebSocket:", error);
      store.dispatch(
        setSocketStatus({ socket: "orderBook", status: "disconnected" })
      );
    }
  }

  private async getInitialSnapshot(symbol: string) {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=1000`
      );
      const data = await response.json();
      console.log("snap shot data", data);

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

  private handleOrderBookUpdate(update: OrderBookUpdate, messageTime: number) {
    if (!this.isInitialized) {
      console.log("Order book not initialized, skipping update");
      return;
    }

    // Calculate latency: time from message receipt to UI update
    const updateStartTime = performance.now();

    store.dispatch(applyOrderBookUpdate(update));

    // Use requestAnimationFrame to measure when the UI actually updates
    requestAnimationFrame(() => {
      const updateEndTime = performance.now();
      const latency = updateEndTime - updateStartTime;

      store.dispatch(setLatency({ socket: "orderBook", latency }));
    });
  }

  private handleReconnect(symbol: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect order book WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      store.dispatch(
        setSocketStatus({ socket: "orderBook", status: "reconnecting" })
      );

      // Clear any existing timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) +
          Math.random() * 1000,
        30000 // Max 30 seconds
      );

      this.reconnectTimeout = setTimeout(() => {
        this.connect(symbol);
      }, delay);
    } else {
      console.log("Max reconnection attempts reached for order book WebSocket");
      store.dispatch(
        setSocketStatus({ socket: "orderBook", status: "disconnected" })
      );
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
      store.dispatch(setConnected(false));
      store.dispatch(
        setSocketStatus({ socket: "orderBook", status: "disconnected" })
      );
      this.isInitialized = false;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const orderBookService = new OrderBookService();
