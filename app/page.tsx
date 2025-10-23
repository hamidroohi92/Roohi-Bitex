import ChartBox from "@/components/homePage/chartBox";
import OrderBook from "@/components/homePage/orderBook";
import OrderTicket from "@/components/homePage/orderTicket";
import PageCard from "@/components/ui/pageCard";

export default function Home() {
  return (
    <div className="flex max-lg:flex-col gap-4 h-full">
      <div className="flex flex-col gap-4 w-6/10 max-lg:w-full">
        <PageCard className="h-[50vh] min-h-[300px]">
          <ChartBox />
        </PageCard>
        <PageCard className="h-fit">
          <OrderTicket />
        </PageCard>
      </div>
      <PageCard className="w-4/10 max-lg:w-full">
        <OrderBook />
      </PageCard>
    </div>
  );
}
