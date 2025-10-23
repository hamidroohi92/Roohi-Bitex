import { setCandles, setCurrentPrice } from "@/redux/slices/symbolSlice";
import { store } from "@/redux/store";
import { Candle } from "@/types/trade";

export class Trade {
  private priceSocket: WebSocket | null = null;
  private currentCandle: Candle | null = null;
  private candles: Candle[] = [];

  public initialize() {
    this.priceSocket = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@trade"
    );

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

      if (this.candles.length > 100) this.candles.shift();
      store.dispatch(setCandles([...this.candles, this.currentCandle]));
      store.dispatch(setCurrentPrice(price));
    };
  }
}
