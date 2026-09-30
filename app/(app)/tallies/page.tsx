import TalliesClient from "./TalliesClient";

export default function TalliesPage() {
  return (
    <div className="space-y-6">
      <header className="pb-6 border-b border-sage/50">
        <h1 className="text-3xl font-bold text-charcoal">Tallies Management</h1>
        <p className="text-charcoal/70 mt-1">Create, edit, and delete your tally trackers</p>
      </header>
      
      <TalliesClient />
    </div>
  );
}
