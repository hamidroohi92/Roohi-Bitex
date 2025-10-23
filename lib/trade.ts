import { setCandles, setCurrentPrice } from "@/redux/slices/symbolSlice";
import { store } from "@/redux/store";
import { Candle } from "@/types/trade";

export class Trade {
  private priceSocket: WebSocket | null = null;
  private currentCandle: Candle | null = null;
  private candles: Candle[] = [];
  constructor() {
    this.priceSocket = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@trade"
    );
  }
  initialize() {
    if (this.priceSocket) return;
    this.priceSocket = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@trade"
    );
    this.priceSocket.onmessage = (event: MessageEvent) => {
      const tradeData = JSON.parse(event.data);
      console.log(tradeData);

      const price = tradeData.p;
      const quantity = tradeData.q;

      // calculate the minute timestamp of the candle
      const candleTime = Math.floor(tradeData.E / 60000) * 60000;

      //create the new candle and push the old one to the list if there is no for current minute
      if (!this.currentCandle || this.currentCandle.time !== candleTime) {
        if (this.currentCandle) {
          this.candles.push(this.currentCandle);
        }
        this.currentCandle = {
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: quantity,
        };
      } else {
        this.currentCandle.high = Math.max(this.currentCandle.high, price);
        this.currentCandle.low = Math.min(this.currentCandle.low, price);
        this.currentCandle.close = price;
        this.currentCandle.volume += quantity;
        this.candles.push(this.currentCandle);
      }

      //just keep the last 100 candles
      if (this.candles.length > 100) {
        this.candles.shift();
      }

      //update the redux symbol store to access it to other part of the projects
      store.dispatch(setCandles([...this.candles]));
      store.dispatch(setCurrentPrice(Number(price)));
    };
  }
}
