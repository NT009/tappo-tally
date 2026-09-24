import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen p-4 sm:p-8">
      <main className="flex flex-col w-full max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-sage/50 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-charcoal">Dashboard</h1>
            <p className="text-charcoal/70 mt-1">Hello, {session.user.name || session.user.email?.split('@')[0]}!</p>
          </div>
          <LogoutButton />
        </header>
        
        {/* Dashboard content removed as requested */}
      </main>
    </div>
  );
}
