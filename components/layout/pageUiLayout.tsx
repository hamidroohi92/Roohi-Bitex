import Header from "./header";

export default function PageUiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 h-screen w-screen p-6 overflow-hidden">
      <Header />
      {children}
    </div>
  );
}
