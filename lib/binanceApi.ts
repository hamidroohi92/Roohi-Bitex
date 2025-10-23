import { Candle } from "@/types/trade";

export interface BinanceKline {
  [0]: number; // Open time
  [1]: string; // Open
  [2]: string; // High
  [3]: string; // Low
  [4]: string; // Close
  [5]: string; // Volume
  [6]: number; // Close time
  [7]: string; // Quote asset volume
  [8]: number; // Number of trades
  [9]: string; // Taker buy base asset volume
  [10]: string; // Taker buy quote asset volume
  [11]: string; // Ignore
}

export class BinanceApi {
  private static readonly BASE_URL = "https://api.binance.com/api/v3";

  /**
   * Fetch historical klines data from Binance API
   */
  static async getKlines(
    symbol: string = "BTCUSDT",
    interval: string = "1m",
    limit: number = 60
  ): Promise<Candle[]> {
    try {
      const url = `${this.BASE_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BinanceKline[] = await response.json();

      // Convert Binance kline format to our Candle format
      return data.map((kline) => ({
        time: kline[0], // Open time in milliseconds
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }));
    } catch (error) {
      console.error("Error fetching klines:", error);
      throw new Error(
        `Failed to fetch klines: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get current price for a symbol
   */
  static async getCurrentPrice(symbol: string = "BTCUSDT"): Promise<number> {
    try {
      const url = `${this.BASE_URL}/ticker/price?symbol=${symbol}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error("Error fetching current price:", error);
      throw new Error(
        `Failed to fetch current price: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
