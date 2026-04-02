import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { toast } from "@/hooks/use-toast";
import { Play, Users, DollarSign, ArrowLeftRight, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type CalcRun = Tables<"calculation_runs">;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [runs, setRuns] = useState<CalcRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchData = async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").order("name"),
      supabase.from("calculation_runs").select("*").order("run_date", { ascending: false }).limit(10),
    ]);
    setProfiles(p ?? []);
    setRuns(r ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (profileId: string, status: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ participant_status: status as any })
      .eq("id", profileId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      fetchData();
    }
  };

  const runCalculation = async () => {
    setRunning(true);
    setShowConfirm(false);

    try {
      // Get active participants
      const { data: active } = await supabase
        .from("profiles")
        .select("id, post_tax_monthly_income, venmo_handle")
        .eq("participant_status", "active");

      if (!active || active.length < 2) {
        toast({ title: "Need at least 2 active participants", variant: "destructive" });
        setRunning(false);
        return;
      }

      const contributions = active.map((p) => ({
        id: p.id,
        income: Number(p.post_tax_monthly_income),
        contribution: Number(p.post_tax_monthly_income) * 0.07,
        venmo_handle: p.venmo_handle,
      }));

      const totalPool = contributions.reduce((sum, c) => sum + c.contribution, 0);
      const equalShare = totalPool / contributions.length;
      const averageIncome = contributions.reduce((sum, c) => sum + c.income, 0) / contributions.length;

      // Net amounts: positive = receive, negative = send
      const nets = contributions.map((c) => ({
        ...c,
        net: equalShare - c.contribution,
      }));

      const senders = nets.filter((n) => n.net < 0).map((n) => ({ ...n, remaining: Math.abs(n.net) }));
      const receivers = nets.filter((n) => n.net > 0).map((n) => ({ ...n, remaining: n.net }));

      // Sort for optimal pairing
      senders.sort((a, b) => b.remaining - a.remaining);
      receivers.sort((a, b) => b.remaining - a.remaining);

      // Generate transaction pairs
      const txns: { sender_id: string; receiver_id: string; amount: number; venmo_deep_link: string | null }[] = [];
      let si = 0, ri = 0;

      while (si < senders.length && ri < receivers.length) {
        const amount = Math.min(senders[si].remaining, receivers[ri].remaining);
        if (amount > 0.01) {
          const handle = receivers[ri].venmo_handle;
          const venmoLink = handle
            ? `https://venmo.com/${handle.replace("@", "")}?txn=pay&amount=${amount.toFixed(2)}&note=Baltimore%20Community%20GI%20Program`
            : null;

          txns.push({
            sender_id: senders[si].id,
            receiver_id: receivers[ri].id,
            amount: Math.round(amount * 100) / 100,
            venmo_deep_link: venmoLink,
          });
        }

        senders[si].remaining -= amount;
        receivers[ri].remaining -= amount;

        if (senders[si].remaining < 0.01) si++;
        if (receivers[ri].remaining < 0.01) ri++;
      }

      // Create the run
      const runDate = new Date();
      const { data: run, error: runError } = await supabase
        .from("calculation_runs")
        .insert({
          run_date: `${runDate.getFullYear()}-${String(runDate.getMonth() + 1).padStart(2, "0")}-01`,
          average_income: Math.round(averageIncome * 100) / 100,
          total_pool: Math.round(totalPool * 100) / 100,
          participant_count: active.length,
          status: "finalized" as const,
          created_by: user?.id,
        })
        .select()
        .single();

      if (runError || !run) {
        toast({ title: "Error creating run", description: runError?.message, variant: "destructive" });
        setRunning(false);
        return;
      }

      // Insert transactions
      if (txns.length > 0) {
        const { error: txnError } = await supabase.from("transactions").insert(
          txns.map((t) => ({ ...t, run_id: run.id }))
        );

        if (txnError) {
          toast({ title: "Error creating transactions", description: txnError.message, variant: "destructive" });
          setRunning(false);
          return;
        }
      }

      toast({
        title: "Calculation complete!",
        description: `${txns.length} transactions created. $${totalPool.toFixed(2)} redistributed among ${active.length} participants.`,
      });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }

    setRunning(false);
  };

  const activeCount = profiles.filter((p) => p.participant_status === "active").length;
  const waitlistedCount = profiles.filter((p) => p.participant_status === "waitlisted").length;
  const latestRun = runs[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setShowConfirm(true)} disabled={running} className="gap-2">
          <Play className="h-4 w-4" />
          {running ? "Running..." : "Run Monthly Calculation"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{waitlistedCount}</p>
                <p className="text-xs text-muted-foreground">Waitlisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {latestRun ? `$${Number(latestRun.total_pool).toFixed(0)}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Last Pool</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{runs.length}</p>
                <p className="text-xs text-muted-foreground">Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>{profiles.length} total members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>ZIP</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                  <TableCell>{p.zip_code}</TableCell>
                  <TableCell>${Number(p.post_tax_monthly_income).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={p.is_verified ? "default" : "secondary"}>
                      {p.is_verified ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={p.participant_status ?? "inactive"}
                      onValueChange={(v) => updateStatus(p.id, v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="waitlisted">Waitlisted</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Runs */}
      {runs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Calculation Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Average Income</TableHead>
                  <TableHead>Total Pool</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.run_date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.participant_count}</TableCell>
                    <TableCell>${Number(r.average_income).toLocaleString()}</TableCell>
                    <TableCell>${Number(r.total_pool).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "finalized" ? "default" : "secondary"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Monthly Calculation?</DialogTitle>
            <DialogDescription>
              This will calculate the redistribution for {activeCount} active participants
              using the 7% contribution model and create transaction assignments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={runCalculation}>Run Calculation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
