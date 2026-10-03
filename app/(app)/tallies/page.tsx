import TalliesClient from "./TalliesClient";

export default function TalliesPage() {
  return (
    <div className="space-y-6">
      <header className="border-b border-sage/50 pb-2 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Tallies Management</h1>
        <p className="text-sm sm:text-base text-charcoal/70 mt-1">Create, edit, and delete your tally trackers</p>
      </header>
      
      <TalliesClient />
    </div>
  );
}
