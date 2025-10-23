"use client";

import { Trade } from "@/lib/trade";
import { RootState } from "@/types/state";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  CandlestickData,
  CandlestickSeries,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export default function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candles = useSelector((state: RootState) => state.symbol.candles);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    new Trade().initialize();

    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => chart.remove();
  }, []);

  // setData when candles change
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    // Convert to valid lightweight format
    const formattedCandles: CandlestickData<Time>[] = candles.map((candle) => ({
      time: Math.floor(candle.time / 1000) as Time, // UNIX seconds
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    if (candles.length === 1) {
      // First load
      seriesRef.current.setData(formattedCandles);
    } else {
      // Only update the last candle
      seriesRef.current.update(formattedCandles[formattedCandles.length - 1]);
    }
  }, [candles]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}
