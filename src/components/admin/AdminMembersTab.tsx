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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Play, ChevronDown, ChevronRight, UserPlus } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import MemberTransactionPanel from "./MemberTransactionPanel";
import AddManagedMemberDialog from "./AddManagedMemberDialog";

type Profile = Tables<"profiles">;
type CalcRun = Tables<"calculation_runs">;

interface AdminMembersTabProps {
  profiles: Profile[];
  runs: CalcRun[];
  onRefresh: () => void;
}

const AdminMembersTab = ({ profiles, runs, onRefresh }: AdminMembersTabProps) => {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddManaged, setShowAddManaged] = useState(false);

  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const runMap = useMemo(() => new Map(runs.map((r) => [r.id, r])), [runs]);

  const activeCount = profiles.filter((p) => p.participant_status === "active").length;

  const updateStatus = async (profileId: string, status: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ participant_status: status as any })
      .eq("id", profileId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      onRefresh();
    }
  };

  const runCalculation = async () => {
    setRunning(true);
    setShowConfirm(false);

    try {
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

      const nets = contributions.map((c) => ({
        ...c,
        net: equalShare - c.contribution,
      }));

      const senders = nets.filter((n) => n.net < 0).map((n) => ({ ...n, remaining: Math.abs(n.net) }));
      const receivers = nets.filter((n) => n.net > 0).map((n) => ({ ...n, remaining: n.net }));

      senders.sort((a, b) => b.remaining - a.remaining);
      receivers.sort((a, b) => b.remaining - a.remaining);

      const txns: { sender_id: string; receiver_id: string; amount: number; venmo_deep_link: string | null }[] = [];
      let si = 0, ri = 0;

      while (si < senders.length && ri < receivers.length) {
        const amount = Math.min(senders[si].remaining, receivers[ri].remaining);
        if (amount > 0.01) {
          const handle = receivers[ri].venmo_handle;
          const venmoLink = handle
            ? `https://venmo.com/${handle.replace("@", "")}?txn=pay&amount=${amount.toFixed(2)}&note=Community%20Guaranteed%20Income%20Club`
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
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }

    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowAddManaged(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add member without email
        </Button>
        <Button onClick={() => setShowConfirm(true)} disabled={running} className="gap-2">
          <Play className="h-4 w-4" />
          {running ? "Running..." : "Run Monthly Calculation"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>{profiles.length} total members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>ZIP</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => {
                const isOpen = expanded === p.id;
                const managed = (p as any).is_steward_managed;
                return (
                  <Fragment key={p.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                >
                  <TableCell>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </TableCell>
                  <TableCell className="font-medium">
                    {p.name}
                    {managed && (
                      <Badge variant="outline" className="ml-2 text-[10px]">Steward-managed</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {managed ? <span className="italic">no email</span> : p.email}
                  </TableCell>
                  <TableCell>{p.zip_code}</TableCell>
                  <TableCell>${Number(p.post_tax_monthly_income).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={p.is_verified ? "default" : "secondary"}>
                      {p.is_verified ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                {isOpen && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={7}>
                      {managed && ((p as any).contact_method || (p as any).contact_notes) && (
                        <div className="mb-3 text-xs text-muted-foreground">
                          <span className="font-medium">Contact:</span>{" "}
                          {(p as any).contact_method ?? "—"}
                          {(p as any).contact_notes && (
                            <> · {(p as any).contact_notes}</>
                          )}
                        </div>
                      )}
                      <MemberTransactionPanel
                        memberId={p.id}
                        profileMap={profileMap}
                        runMap={runMap}
                      />
                    </TableCell>
                  </TableRow>
                )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Runs */}
      {runs.length > 0 && (
        <Card>
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

      <AddManagedMemberDialog
        open={showAddManaged}
        onOpenChange={setShowAddManaged}
        onCreated={onRefresh}
      />
    </div>
  );
};

export default AdminMembersTab;
