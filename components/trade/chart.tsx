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
  ColorType,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@/components/providers/themeContext";

export default function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candles = useSelector((state: RootState) => state.symbol.candles);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    new Trade().initialize();

    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: {
          type: ColorType.Solid,
          color: theme === "dark" ? "#1f2937" : "#ffffff",
        },
        textColor: theme === "dark" ? "#f3f4f6" : "#1f2937",
      },
      grid: {
        vertLines: { color: theme === "dark" ? "#374151" : "#e5e7eb" },
        horzLines: { color: theme === "dark" ? "#374151" : "#e5e7eb" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
      },
      timeScale: {
        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
      },
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
  }, [theme]);

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
