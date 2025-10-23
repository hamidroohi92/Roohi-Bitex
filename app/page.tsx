import ChartBox from "@/components/homePage/chartBox";
import OrderBook from "@/components/homePage/orderBook";
import OrderTicket from "@/components/homePage/orderTicket";

export default function Home() {
  return (
    <div className="flex gap-4 h-full">
      <div className="flex flex-col gap-4 w-[60%]">
        <div className="h-[50vh] min-h-[300px] bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transition-colors duration-300">
          <ChartBox />
        </div>
        <div className="h-fit bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transition-colors duration-300">
          <OrderTicket />
        </div>
      </div>
      <div className="w-[40%] bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transition-colors duration-300">
        <OrderBook />
      </div>
    </div>
  );
}
