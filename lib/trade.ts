import { setCandles, setCurrentPrice } from "@/redux/slices/symbolSlice";
import { setSocketStatus, setLatency } from "@/redux/slices/appSlice";
import { store } from "@/redux/store";
import { Candle } from "@/types/trade";
import { BinanceApi } from "./binanceApi";

export class Trade {
  private priceSocket: WebSocket | null = null;
  private currentCandle: Candle | null = null;
  private candles: Candle[] = [];
  private symbol: string = "BTCUSDT";
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  public async initialize(symbol: string = "BTCUSDT") {
    this.symbol = symbol;

    try {
      // Load initial historical data
      await this.loadInitialData();

      // Start WebSocket connection for real-time updates
      this.startWebSocket();
    } catch (error) {
      console.error("Failed to initialize trade data:", error);
      throw error;
    }
  }

  private async loadInitialData() {
    try {
      console.log("Loading initial klines data...");

      // Fetch historical klines data
      const historicalCandles = await BinanceApi.getKlines(
        this.symbol,
        "1m",
        60
      );

      // Set the historical candles
      //remove the last candle because it is not complete
      historicalCandles.pop();
      this.candles = historicalCandles;

      console.log(`Loaded ${historicalCandles.length} historical candles`);
    } catch (error) {
      console.error("Error loading initial data:", error);
      throw error;
    }
  }

  private startWebSocket() {
    const symbolLower = this.symbol.toLowerCase();
    this.priceSocket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbolLower}@trade`
    );

    this.priceSocket.onopen = () => {
      console.log("Trade WebSocket connected for real-time updates");
      store.dispatch(setSocketStatus({ socket: "trade", status: "connected" }));
      this.reconnectAttempts = 0;
    };

    this.priceSocket.onerror = (error) => {
      console.error("Trade WebSocket error:", error);
      store.dispatch(
        setSocketStatus({ socket: "trade", status: "disconnected" })
      );
    };

    this.priceSocket.onclose = () => {
      console.log("Trade WebSocket connection closed");
      store.dispatch(
        setSocketStatus({ socket: "trade", status: "disconnected" })
      );
      this.handleReconnect();
    };

    this.priceSocket.onmessage = (event: MessageEvent) => {
      const messageTime = Date.now();
      const tradeData = JSON.parse(event.data);
      const price = parseFloat(tradeData.p);
      const quantity = parseFloat(tradeData.q);

      const candleTime = Math.floor(tradeData.E / 60000) * 60000;

      if (!this.currentCandle || this.currentCandle.time !== candleTime) {
        if (this.currentCandle) this.candles.push(this.currentCandle);

        this.currentCandle = {
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: quantity,
        };
      } else {
        this.currentCandle = {
          ...this.currentCandle,
          high: Math.max(this.currentCandle.high, price),
          low: Math.min(this.currentCandle.low, price),
          close: price,
          volume: this.currentCandle.volume + quantity,
        };
      }

      // Keep only last 60 candles
      if (this.candles.length > 60) this.candles.shift();

      // Calculate latency: time from message receipt to UI update
      const updateStartTime = performance.now();

      // Update Redux store with all candles including current
      store.dispatch(setCandles([...this.candles, this.currentCandle]));
      store.dispatch(setCurrentPrice(price));

      // Use requestAnimationFrame to measure when the UI actually updates
      requestAnimationFrame(() => {
        const updateEndTime = performance.now();
        const latency = updateEndTime - updateStartTime;

        store.dispatch(setLatency({ socket: "trade", latency }));
      });
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect trade WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      store.dispatch(
        setSocketStatus({ socket: "trade", status: "reconnecting" })
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
        this.startWebSocket();
      }, delay);
    } else {
      console.log("Max reconnection attempts reached for trade WebSocket");
      store.dispatch(
        setSocketStatus({ socket: "trade", status: "disconnected" })
      );
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.priceSocket) {
      this.priceSocket.close();
      this.priceSocket = null;
      store.dispatch(
        setSocketStatus({ socket: "trade", status: "disconnected" })
      );
    }
  }
}
