"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, CloudUpload, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tally = {
  _id: string;
  name: string;
  color: string;
  incrementRate: number;
  todayCount: number;
};

function getContrastColor(hexColor: string) {
  if (!hexColor || !hexColor.startsWith('#')) return 'text-white';
  
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? 'text-black' : 'text-white';
}

export default function DashboardClient() {
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track tallies that are currently saving to the server
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  
  // Refs to hold pending increments and debounce timers without causing re-renders
  const pending = useRef<Record<string, number>>({});
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12; // Show 12 cards per page

  useEffect(() => {
    fetchTallies();
    return () => {
      // Clear all timers on unmount
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, [page]);

  const fetchTallies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tallies?countToday=true&page=${page}&limit=${limit}`);
      const json = await res.json();
      if (json.success) {
        setTallies(json.data);
        setTotalPages(json.pagination.totalPages || 1);
      } else {
        toast.error("Failed to load tallies");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = (tally: Tally) => {
    // 1. Optimistic instant UI update
    setTallies(prev => prev.map(t => 
      t._id === tally._id ? { ...t, todayCount: t.todayCount + t.incrementRate } : t
    ));

    // 2. Accumulate pending count in ref
    const currentPending = pending.current[tally._id] || 0;
    pending.current[tally._id] = currentPending + tally.incrementRate;

    // 3. Clear existing debounce timer
    if (timers.current[tally._id]) {
      clearTimeout(timers.current[tally._id]);
    }

    // 4. Start new debounce timer (wait 700ms after last click to sync)
    timers.current[tally._id] = setTimeout(() => {
      flushIncrement(tally);
    }, 700);
  };

  const flushIncrement = async (tally: Tally) => {
    const amountToSync = pending.current[tally._id];
    if (!amountToSync) return;

    // Clear the pending amount so new rapid clicks accumulate in a new batch
    pending.current[tally._id] = 0;
    
    // Trigger visual sync indicator
    setSyncingIds(prev => {
      const next = new Set(prev);
      next.add(tally._id);
      return next;
    });

    try {
      const res = await fetch("/api/tally-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tallyId: tally._id, incrementAmount: amountToSync }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    } catch (err) {
      // Revert the UI if the network request fails
      setTallies(prev => prev.map(t => 
        t._id === tally._id ? { ...t, todayCount: Math.max(0, t.todayCount - amountToSync) } : t
      ));
      toast.error(`Failed to sync ${tally.name}`);
    } finally {
      // Remove visual sync indicator
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(tally._id);
        return next;
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (tallies.length === 0 && page === 1) {
    return (
      <div className="text-center py-12 border border-border border-dashed rounded-xl bg-card text-muted-foreground">
        You haven't created any tallies yet. Go to the Tallies page to get started!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {tallies.map(tally => {
          const isSyncing = syncingIds.has(tally._id);
          const textColor = getContrastColor(tally.color);
          
          return (
            <button
              key={tally._id}
              onClick={() => handleIncrement(tally)}
              // Note: We deliberately do NOT disable the button during sync, allowing rapid endless tapping
              className={`relative flex flex-col items-center justify-center p-4 sm:p-8 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all ${textColor}`}
              style={{ backgroundColor: tally.color }}
            >
              {/* Sync Indicator */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 h-5 flex items-center justify-center opacity-50">
                {isSyncing && <CloudUpload className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />}
              </div>

              <span className="text-sm sm:text-xl font-medium mb-1 sm:mb-4 truncate w-full px-2 text-center">{tally.name}</span>
              <div className="text-4xl sm:text-6xl font-bold select-none transition-transform active:scale-90">
                {tally.todayCount}
              </div>
              <span className="text-[10px] sm:text-sm mt-1 sm:mt-4 select-none opacity-80">
                Tap to add {tally.incrementRate}
              </span>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="icon"
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline"
              size="icon"
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
