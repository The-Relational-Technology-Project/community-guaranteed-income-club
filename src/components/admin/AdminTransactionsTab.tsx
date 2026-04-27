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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Download, MoreHorizontal } from "lucide-react";
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
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
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
                    {new Date(r.run_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
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
                          ? new Date(run.run_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })
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
    </div>
  );
};

export default AdminTransactionsTab;