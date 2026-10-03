import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";
import { Home, List, Calendar, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function NavLinks() {
  return (
    <>
      <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium transition-colors">
        <Home className="w-5 h-5 text-primary" /> Dashboard
      </Link>
      <Link href="/tallies" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium transition-colors">
        <List className="w-5 h-5 text-primary" /> Tallies
      </Link>
      <Link href="/tally-entries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium transition-colors">
        <Calendar className="w-5 h-5 text-primary" /> History
      </Link>
      <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground font-medium transition-colors">
        <User className="w-5 h-5 text-primary" /> Profile
      </Link>
    </>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card flex items-center justify-between px-4 z-40">
        <h1 className="text-xl font-bold text-foreground">Tappo Tally</h1>
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0 flex flex-col bg-card border-r border-border">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-bold text-foreground">Tappo Tally</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              <NavLinks />
            </nav>
            <div className="p-4 border-t border-border">
              <LogoutButton />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-border flex-col bg-card">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Tappo Tally</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-border">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pt-20 sm:p-8 sm:pt-24 md:pt-8">
        <div className="max-w-5xl mx-auto pb-24 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
