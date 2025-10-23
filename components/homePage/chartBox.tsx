import Chart from "../trade/chart";

export default function ChartBox() {
  return (
    <div className="w-full h-full">
      <h1 className="text-gray-800 dark:text-gray-200 text-xl font-semibold mb-4">BTC/USDT Chart</h1>
      <Chart />
    </div>
  );
}
