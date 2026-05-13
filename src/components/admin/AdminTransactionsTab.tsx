import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Download, MoreHorizontal, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type CalcRun = Tables<"calculation_runs">;
type Transaction = Tables<"transactions">;

interface Props {
  profiles: Profile[];
  runs: CalcRun[];
}

const AdminTransactionsTab = ({ profiles, runs }: Props) => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [runFilter, setRunFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{ type: "single"; id: string; label: string } | { type: "bulk"; runId: string; label: string; count: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const runMap = useMemo(() => new Map(runs.map((r) => [r.id, r])), [runs]);

  const fetchTxns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    setTxns(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTxns();
  }, []);

  const filtered = useMemo(() => {
    return txns.filter((t) => {
      if (runFilter !== "all" && t.run_id !== runFilter) return false;
      if (statusFilter === "fully" && !(t.is_confirmed_sender && t.is_confirmed_receiver)) return false;
      if (statusFilter === "pending_sender" && t.is_confirmed_sender) return false;
      if (statusFilter === "pending_receiver" && t.is_confirmed_receiver) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        const sn = profileMap.get(t.sender_id)?.name?.toLowerCase() ?? "";
        const rn = profileMap.get(t.receiver_id)?.name?.toLowerCase() ?? "";
        if (!sn.includes(s) && !rn.includes(s)) return false;
      }
      return true;
    });
  }, [txns, runFilter, statusFilter, search, profileMap]);

  const manualConfirm = async (txnId: string, side: "sender" | "receiver") => {
    const update =
      side === "sender"
        ? { is_confirmed_sender: true, confirmed_sender_at: new Date().toISOString() }
        : { is_confirmed_receiver: true, confirmed_receiver_at: new Date().toISOString() };

    const { error } = await supabase.from("transactions").update(update).eq("id", txnId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Marked ${side} confirmed` });
      fetchTxns();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    let error;
    if (deleteTarget.type === "single") {
      ({ error } = await supabase.from("transactions").delete().eq("id", deleteTarget.id));
    } else {
      ({ error } = await supabase.from("transactions").delete().eq("run_id", deleteTarget.runId));
    }

    setDeleting(false);
    setDeleteTarget(null);

    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: deleteTarget.type === "single" ? "Transaction deleted" : `${deleteTarget.count} transactions deleted`,
      });
      fetchTxns();
    }
  };

  const runTxnCounts = useMemo(() => {
    const counts = new Map<string, number>();
    txns.forEach((t) => counts.set(t.run_id, (counts.get(t.run_id) ?? 0) + 1));
    return counts;
  }, [txns]);

  const exportCSV = () => {
    const rows = [
      ["Date", "Sender", "Receiver", "Amount", "Sender confirmed", "Receiver confirmed"],
      ...filtered.map((t) => [
        new Date(t.created_at).toISOString(),
        profileMap.get(t.sender_id)?.name ?? "",
        profileMap.get(t.receiver_id)?.name ?? "",
        Number(t.amount).toFixed(2),
        t.is_confirmed_sender ? "yes" : "no",
        t.is_confirmed_receiver ? "yes" : "no",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                {filtered.length} of {txns.length} transactions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {runFilter !== "all" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const run = runMap.get(runFilter);
                    const count = runTxnCounts.get(runFilter) ?? 0;
                    const label = run
                      ? new Date(run.run_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "this run";
                    setDeleteTarget({ type: "bulk", runId: runFilter, label, count });
                  }}
                  className="gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete run ({runTxnCounts.get(runFilter) ?? 0})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            </div>
          </div>

          <div className="grid gap-2 pt-3 md:grid-cols-3">
            <Input
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={runFilter} onValueChange={setRunFilter}>
              <SelectTrigger><SelectValue placeholder="Run" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All runs</SelectItem>
                {runs.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {new Date(r.run_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="fully">Fully confirmed</SelectItem>
                <SelectItem value="pending_sender">Pending sender</SelectItem>
                <SelectItem value="pending_receiver">Pending receiver</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const s = profileMap.get(t.sender_id);
                  const r = profileMap.get(t.receiver_id);
                  const run = runMap.get(t.run_id);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {run
                          ? new Date(run.run_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                          : new Date(t.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">{s?.name ?? "—"}</TableCell>
                      <TableCell><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /></TableCell>
                      <TableCell className="text-sm">{r?.name ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">${Number(t.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={t.is_confirmed_sender ? "default" : "secondary"} className="text-[10px]">
                          {t.is_confirmed_sender ? "✓ sent" : "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.is_confirmed_receiver ? "default" : "secondary"} className="text-[10px]">
                          {t.is_confirmed_receiver ? "✓ received" : "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              disabled={!!t.is_confirmed_sender}
                              onClick={() => manualConfirm(t.id, "sender")}
                            >
                              Mark sender confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={!!t.is_confirmed_receiver}
                              onClick={() => manualConfirm(t.id, "receiver")}
                            >
                              Mark receiver confirmed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                const senderName = s?.name ?? "unknown";
                                const receiverName = r?.name ?? "unknown";
                                setDeleteTarget({
                                  type: "single",
                                  id: t.id,
                                  label: `${senderName} → ${receiverName} ($${Number(t.amount).toFixed(2)})`,
                                });
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete transaction
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                      No transactions match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === "single"
                ? `This will permanently delete the transaction: ${deleteTarget.label}.`
                : deleteTarget?.type === "bulk"
                ? `This will permanently delete all ${deleteTarget.count} transactions from the ${deleteTarget.label} run.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-1.5">
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Yes, delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTransactionsTab;
