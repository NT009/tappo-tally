"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      await authClient.signOut();
      toast.success("Successfully logged out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex justify-center items-center px-4 py-2 text-sm font-medium text-terracotta border border-terracotta rounded hover:bg-terracotta hover:text-white transition-colors disabled:opacity-70"
    >
      {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Sign Out"}
    </button>
  );
}
