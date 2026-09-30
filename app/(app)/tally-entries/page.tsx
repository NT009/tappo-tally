import HistoryClient from "./HistoryClient";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <header className="pb-6 border-b border-sage/50">
        <h1 className="text-3xl font-bold text-charcoal">History Matrix</h1>
        <p className="text-charcoal/70 mt-1">Visualize your habits over time</p>
      </header>
      
      <HistoryClient />
    </div>
  );
}
