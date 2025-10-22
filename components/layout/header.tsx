export default function Header() {
  const balance = 200000;
  return (
    <div className="flex justify-between items-center h-[10vh] bg-gray-300 rounded-2xl p-4">
      <h1>Hi, Hamid Roohi</h1>
      <h2>Your Balance: ${balance}</h2>
    </div>
  );
}
