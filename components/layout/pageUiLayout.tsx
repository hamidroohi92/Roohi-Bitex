import Header from "./header";

//UI layout for the whole app. This will organize all the pages styles and components.
export default function PageUiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 h-fit w-screen p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Header />
      {children}
    </div>
  );
}
