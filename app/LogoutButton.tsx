"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout} 
      className="w-full justify-start text-foreground"
    >
      <LogOut className="w-4 h-4 mr-2" /> Logout
    </Button>
  );
}
