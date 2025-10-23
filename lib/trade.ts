import { setCandles, setCurrentPrice } from "@/redux/slices/symbolSlice";
import { store } from "@/redux/store";
import { Candle } from "@/types/trade";
import { BinanceApi } from "./binanceApi";

export class Trade {
  private priceSocket: WebSocket | null = null;
  private currentCandle: Candle | null = null;
  private candles: Candle[] = [];
  private symbol: string = "BTCUSDT";

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
      console.log("WebSocket connected for real-time updates");
    };

    this.priceSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.priceSocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    this.priceSocket.onmessage = (event: MessageEvent) => {
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

      // Update Redux store with all candles including current
      store.dispatch(setCandles([...this.candles, this.currentCandle]));
      store.dispatch(setCurrentPrice(price));
    };
  }

  public disconnect() {
    if (this.priceSocket) {
      this.priceSocket.close();
      this.priceSocket = null;
    }
  }
}
