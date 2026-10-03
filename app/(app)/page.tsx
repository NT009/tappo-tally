import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DashboardClient from "./DashboardClient";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="space-y-6">
      <header className="border-b border-sage/50 pb-2 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Dashboard</h1>
        <p className="text-sm sm:text-base text-charcoal/70 mt-1">Hello, {session?.user?.name || session?.user?.email?.split('@')[0]}!</p>
      </header>
      
      <DashboardClient />
    </div>
  );
}
