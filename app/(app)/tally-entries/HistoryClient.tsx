"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

type Tally = { _id: string; name: string; color: string; };
type TallyEntry = { tallyId: string; date: string; count: number; };

import { Button } from "@/components/ui/button";

export default function HistoryClient() {
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [entries, setEntries] = useState<Record<string, { date: string; count: number }[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(dayjs());
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchData();
  }, [currentDate, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const monthStr = currentDate.format("YYYY-MM");
      const [talliesRes, entriesRes] = await Promise.all([
        fetch(`/api/tallies?page=${page}&limit=${limit}`),
        fetch(`/api/tally-entries?month=${monthStr}`)
      ]);
      
      const talliesJson = await talliesRes.json();
      const entriesJson = await entriesRes.json();
      
      if (talliesJson.success) {
        setTallies(talliesJson.data);
        setTotalPages(talliesJson.pagination.totalPages || 1);
      }
      if (entriesJson.success) setEntries(entriesJson.data);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => setCurrentDate(prev => prev.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(prev => prev.add(1, 'month'));

  const now = dayjs();
  const isCurrentMonth = currentDate.isSame(now, 'month');
  const daysToRender = isCurrentMonth ? now.date() : currentDate.daysInMonth();
  const daysArray = Array.from({ length: daysToRender }, (_, i) => i + 1);

  // entryMap[tallyId][dateStr] = count
  const entryMap: Record<string, Record<string, number>> = {};
  Object.entries(entries).forEach(([tallyId, tallyEntries]) => {
    if (!entryMap[tallyId]) entryMap[tallyId] = {};
    tallyEntries.forEach(e => {
      entryMap[tallyId][e.date] = e.count;
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 border border-border rounded-xl shadow-sm">
        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
        <h2 className="text-xl font-bold text-foreground">{currentDate.format("MMMM YYYY")}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-forest" /></div>
      ) : tallies.length === 0 ? (
        <div className="text-center py-12 border border-border border-dashed rounded-xl bg-card text-muted-foreground">
          No tallies found. Create one first.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-3 text-left font-medium text-foreground sticky left-0 bg-muted/50 shadow-[1px_0_0_0_var(--border)] z-10 min-w-[150px]">Tally</th>
                {daysArray.map(day => (
                  <th key={day} className="p-2 min-w-[40px] text-sm font-medium text-muted-foreground border-l border-border/50">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tallies.map(tally => (
                <tr key={tally._id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-3 text-left font-medium text-foreground sticky left-0 bg-card shadow-[1px_0_0_0_var(--border)] z-10 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tally.color }} />
                    {tally.name}
                  </td>
                  {daysArray.map(day => {
                    const dateStr = currentDate.date(day).format("YYYY-MM-DD");
                    const count = entryMap[tally._id]?.[dateStr] || 0;
                    return (
                      <td key={day} className="p-2 border-l border-border/50">
                        {count > 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold text-white shadow-sm" style={{ backgroundColor: tally.color }}>
                            {count}
                          </span>
                        ) : <span className="text-muted-foreground/30">-</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && tallies.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
