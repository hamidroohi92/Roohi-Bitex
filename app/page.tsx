import ChartBox from "@/components/homePage/chartBox";
import OrderBook from "@/components/homePage/orderBook";
import OrderTicket from "@/components/homePage/orderTicket";
import PageCard from "@/components/ui/pageCard";

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex flex-col gap-4 w-full lg:w-[60%]">
        <PageCard className="h-[50vh] min-h-[300px]">
          <ChartBox />
        </PageCard>
        <PageCard className="h-fit">
          <OrderTicket />
        </PageCard>
      </div>
      <PageCard className="w-full lg:w-[40%]">
        <OrderBook />
      </PageCard>
    </div>
  );
}
