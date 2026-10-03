"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Tally = {
  _id: string;
  name: string;
  color: string;
  incrementRate: number;
  createdAt: string;
};

export default function TalliesClient() {
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [tallyToDelete, setTallyToDelete] = useState<Tally | null>(null);
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 5;

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1F6F50");
  const [incrementRate, setIncrementRate] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Reset page to 1 on search change
    setPage(1);
  }, [search]);

  const fetchTallies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tallies?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setTallies(json.data);
        setTotalPages(json.pagination.totalPages || 1);
      }
    } catch {
      toast.error("Failed to load tallies");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchTallies();
  }, [fetchTallies]);

  const openModal = (tally?: Tally) => {
    if (tally) {
      setEditId(tally._id);
      setName(tally.name);
      setColor(tally.color);
      setIncrementRate(tally.incrementRate);
    } else {
      setEditId(null);
      setName("");
      setColor("#1F6F50");
      setIncrementRate(1);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const url = editId ? `/api/tallies/${editId}` : "/api/tallies";
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, incrementRate }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Tally ${editId ? "updated" : "created"}!`);
        setIsModalOpen(false);
        fetchTallies();
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!tallyToDelete) return;
    
    const id = tallyToDelete._id;
    setIsDeleting(id);
    setTallyToDelete(null);
    
    try {
      const res = await fetch(`/api/tallies/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Tally deleted");
        fetchTallies();
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Input 
          placeholder="Search tallies..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => openModal()}>
          <Plus className="w-5 h-5 mr-2" /> New Tally
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Increment Rate</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : tallies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No tallies found.
                </TableCell>
              </TableRow>
            ) : tallies.map(tally => (
              <TableRow key={tally._id}>
                <TableCell className="font-medium">{tally.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-border shadow-sm" style={{ backgroundColor: tally.color }} />
                    <span className="text-sm text-muted-foreground uppercase">{tally.color}</span>
                  </div>
                </TableCell>
                <TableCell>{tally.incrementRate}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(tally.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openModal(tally)} className="text-muted-foreground hover:text-primary">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setTallyToDelete(tally)} 
                    disabled={isDeleting === tally._id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                  >
                    {isDeleting === tally._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
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

      {/* Dialog for Create/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Tally" : "New Tally"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="colorText">Color (Hex)</Label>
                <Input id="colorText" required type="text" value={color} onChange={e => setColor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colorPicker">Picker</Label>
                <Input id="colorPicker" type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-16 p-1 cursor-pointer" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Increment Rate</Label>
              <Input id="rate" required type="number" min="1" value={incrementRate} onChange={e => setIncrementRate(Number(e.target.value))} />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Tally
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for Deletion */}
      <AlertDialog open={!!tallyToDelete} onOpenChange={(open) => !open && setTallyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              <span className="font-semibold text-foreground"> {tallyToDelete?.name} </span> 
              tally and remove all of its recorded history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, delete tally
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
