"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Globe, Mail, User as UserIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/app/LogoutButton";

export default function ProfilePage() {
  const [updating, setUpdating] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleUpdateTimezone = async () => {
    setUpdating(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/user/timezone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Timezone updated to ${timezone}`);
      } else {
        toast.error("Failed to update timezone");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="pb-4 mb-4 sm:pb-6 sm:mb-6 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your settings</p>
      </header>

      <div className="bg-card border border-border p-6 rounded-xl shadow-sm max-w-md space-y-6">
        
        {isPending ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* User Information */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" /> Account Details
              </h2>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Name</span>
                  <span className="text-base text-foreground font-medium">{session?.user?.name || "No name set"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <span className="text-base text-foreground font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {session?.user?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Timezone Settings */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> Timezone Settings
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Current: <span className="font-semibold text-foreground">{(session?.user as any)?.timezone || "Not set"}</span>
                </p>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleUpdateTimezone}
                  disabled={updating}
                  title="Sync Timezone"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            {/* Logout */}
            <div className="pt-6 border-t border-border">
              <LogoutButton />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
