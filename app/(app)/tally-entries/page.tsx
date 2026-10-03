import HistoryClient from "./HistoryClient";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <header className="border-b border-sage/50 pb-2 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">History Matrix</h1>
        <p className="text-sm sm:text-base text-charcoal/70 mt-1">Visualize your habits over time</p>
      </header>
      
      <HistoryClient />
    </div>
  );
}
