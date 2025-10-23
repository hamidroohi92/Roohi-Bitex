import ChartBox from "@/components/homePage/chartBox";
import OrderBook from "@/components/homePage/orderBook";
import OrderTicket from "@/components/homePage/orderTicket";

export default function Home() {
  return (
    <div className="flex gap-4 h-full">
      <div className="flex flex-col gap-4 w-[60%]">
        <div className="h-[50vh] min-h-[300px] bg-gray-300 rounded-2xl p-4">
          <ChartBox />
        </div>
        <div className="h-fit bg-gray-300 rounded-2xl p-4">
          <OrderTicket />
        </div>
      </div>
      <div className="w-[40%]  bg-gray-300 rounded-2xl p-4">
        <OrderBook />
      </div>
    </div>
  );
}
