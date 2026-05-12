import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ArrowDown, ArrowUp, Calculator, Equal, Percent, Play, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type CalcRun = Tables<"calculation_runs">;

interface AdminMathViewProps {
  profiles: Profile[];
  runs: CalcRun[];
  onRefresh?: () => void;
}

const AdminMathView = ({ profiles, runs, onRefresh }: AdminMathViewProps) => {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const activeProfiles = profiles.filter((p) => p.participant_status === "active");

  const contributions = activeProfiles.map((p) => {
    const income = Number(p.post_tax_monthly_income ?? 0);
    const loans = Number(p.student_loan_payment ?? 0);
    const taxable = Math.max(0, income - loans);
    const contribution = taxable * 0.07;
    return { id: p.id, name: p.name, income, loans, contribution, venmo_handle: p.venmo_handle };
  });

  const totalPool = contributions.reduce((sum, c) => sum + c.contribution, 0);
  const equalShare = contributions.length > 0 ? totalPool / contributions.length : 0;
  const averageIncome = contributions.length > 0
    ? contributions.reduce((sum, c) => sum + c.income, 0) / contributions.length
    : 0;

  const breakdown = contributions
    .map((c) => ({
      ...c,
      net: equalShare - c.contribution,
      role: equalShare - c.contribution > 0.01 ? "receiver" : equalShare - c.contribution < -0.01 ? "sender" : "neutral",
    }))
    .sort((a, b) => a.net - b.net);

  const senders = breakdown.filter((b) => b.role === "sender");
  const receivers = breakdown.filter((b) => b.role === "receiver");
  const neutrals = breakdown.filter((b) => b.role === "neutral");

  const lastRun = runs[0];
  const lastRunDate = lastRun ? new Date(lastRun.run_date) : null;
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const alreadyRanThisMonth = lastRunDate && lastRunDate >= currentMonthStart;

  const runCalculation = async () => {
    setRunning(true);
    setShowConfirm(false);

    try {
      const { data: active } = await supabase
        .from("profiles")
        .select("id, post_tax_monthly_income, student_loan_payment, venmo_handle")
        .eq("participant_status", "active");

      if (!active || active.length < 2) {
        toast({ title: "Need at least 2 active participants", variant: "destructive" });
        setRunning(false);
        return;
      }

      const contribs = active.map((p) => ({
        id: p.id,
        income: Number(p.post_tax_monthly_income),
        contribution: Math.max(0, Number(p.post_tax_monthly_income) - Number(p.student_loan_payment ?? 0)) * 0.07,
        venmo_handle: p.venmo_handle,
      }));

      const pool = contribs.reduce((sum, c) => sum + c.contribution, 0);
      const share = pool / contribs.length;
      const avgIncome = contribs.reduce((sum, c) => sum + c.income, 0) / contribs.length;

      const nets = contribs.map((c) => ({ ...c, net: share - c.contribution }));

      const sendersCalc = nets.filter((n) => n.net < 0).map((n) => ({ ...n, remaining: Math.abs(n.net) }));
      const receiversCalc = nets.filter((n) => n.net > 0).map((n) => ({ ...n, remaining: n.net }));

      sendersCalc.sort((a, b) => b.remaining - a.remaining);
      receiversCalc.sort((a, b) => b.remaining - a.remaining);

      const txns: { sender_id: string; receiver_id: string; amount: number; venmo_deep_link: string | null }[] = [];
      let si = 0, ri = 0;

      while (si < sendersCalc.length && ri < receiversCalc.length) {
        const amount = Math.min(sendersCalc[si].remaining, receiversCalc[ri].remaining);
        if (amount > 0.01) {
          const receiverVenmo = receiversCalc[ri].venmo_handle;
          const venmoLink = receiverVenmo
            ? `https://venmo.com/${receiverVenmo.replace("@", "")}?txn=pay&amount=${amount.toFixed(2)}&note=Community%20redistribution`
            : null;

          txns.push({
            sender_id: sendersCalc[si].id,
            receiver_id: receiversCalc[ri].id,
            amount: Math.round(amount * 100) / 100,
            venmo_deep_link: venmoLink,
          });
        }
        sendersCalc[si].remaining -= amount;
        receiversCalc[ri].remaining -= amount;
        if (sendersCalc[si].remaining < 0.01) si++;
        if (receiversCalc[ri].remaining < 0.01) ri++;
      }

      const today = new Date();
      const runDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

      const { data: run, error: runError } = await supabase
        .from("calculation_runs")
        .insert({
          run_date: runDate,
          status: "finalized" as any,
          participant_count: contribs.length,
          total_pool: pool,
          average_income: avgIncome,
          created_by: user?.id,
        })
        .select()
        .single();

      if (runError || !run) throw runError;

      if (txns.length > 0) {
        const { error: txnError } = await supabase
          .from("transactions")
          .insert(txns.map((t) => ({ ...t, run_id: run.id })));
        if (txnError) throw txnError;
      }

      toast({ title: "Calculation complete!", description: `${txns.length} transactions created for ${contribs.length} participants.` });
      onRefresh?.();
    } catch (err: any) {
      toast({ title: "Calculation failed", description: err?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Run Calculation Button */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg font-display flex items-center gap-2">
              <Play className="h-5 w-5 text-accent" />
              Run Monthly Calculation
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {alreadyRanThisMonth
                ? `Already ran for ${currentMonthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}. Running again will create duplicate transactions.`
                : `Ready to run for ${currentMonthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}. This will create transactions for ${activeProfiles.length} active members.`}
            </p>
            {lastRun && (
              <p className="text-xs text-muted-foreground mt-1">
                Last run: {new Date(lastRun.run_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {lastRun.participant_count} participants · ${Number(lastRun.total_pool).toLocaleString()} pool
              </p>
            )}
          </div>
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={running}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2 min-w-[180px]"
            size="lg"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Running..." : alreadyRanThisMonth ? "Run Again" : "Run Now"}
          </Button>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run monthly calculation?</DialogTitle>
            <DialogDescription>
              This will calculate redistribution amounts for {activeProfiles.length} active participants and create transactions.
              {alreadyRanThisMonth && (
                <span className="block mt-2 text-destructive font-medium">
                  ⚠️ A calculation was already run this month. Running again will create duplicate transactions.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm space-y-1 bg-muted p-3 rounded-md">
            <p><strong>Participants:</strong> {activeProfiles.length}</p>
            <p><strong>Estimated Pool:</strong> ${totalPool.toFixed(2)}</p>
            <p><strong>Equal Share:</strong> ${equalShare.toFixed(2)}</p>
            <p><strong>Senders:</strong> {senders.length} · <strong>Receivers:</strong> {receivers.length}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={runCalculation} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              <Play className="h-4 w-4" />
              Confirm & Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Algorithm Explanation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            How the Math Works
          </CardTitle>
          <CardDescription>Transparency into the redistribution algorithm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            {[
              { step: "1", title: "Collect 7%", desc: "Each participant contributes 7% of their post-tax monthly income" },
              { step: "2", title: "Pool the money", desc: "All contributions go into a shared pool" },
              { step: "3", title: "Divide equally", desc: "The pool is divided equally among all participants" },
              { step: "4", title: "Net difference", desc: 'If share > contribution → receive. If share < contribution → send.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-2">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Percent className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Contribution Rate</p>
            <p className="text-xl font-bold">7%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Equal className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Avg. Income</p>
            <p className="text-xl font-bold">${averageIncome.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-xs text-muted-foreground mt-1">Total Pool</p>
            <p className="text-xl font-bold text-primary">${totalPool.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-xs text-muted-foreground mt-1">Equal Share</p>
            <p className="text-xl font-bold">${equalShare.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="destructive" className="text-sm px-3 py-1">
          <ArrowUp className="h-3 w-3 mr-1" />
          {senders.length} Senders
        </Badge>
        <Badge variant="default" className="text-sm px-3 py-1">
          <ArrowDown className="h-3 w-3 mr-1" />
          {receivers.length} Receivers
        </Badge>
        {neutrals.length > 0 && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {neutrals.length} Neutral
          </Badge>
        )}
      </div>

      {/* Per-Person Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per-Person Breakdown (Live Preview)</CardTitle>
          <CardDescription>Based on current active participants' income data. This is what would happen if you ran the calculation now.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Monthly Income</TableHead>
                <TableHead className="text-right">Student Loans</TableHead>
                <TableHead className="text-right">7% Contribution</TableHead>
                <TableHead className="text-right">Equal Share</TableHead>
                <TableHead className="text-right">Net Amount</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">${row.income.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${row.loans.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${row.contribution.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${equalShare.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-medium ${row.net > 0 ? "text-green-600 dark:text-green-400" : row.net < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                    {row.net > 0 ? "+" : ""}{row.net.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.role === "sender" ? "destructive" : row.role === "receiver" ? "default" : "secondary"}>
                      {row.role === "sender" && <ArrowUp className="h-3 w-3 mr-1" />}
                      {row.role === "receiver" && <ArrowDown className="h-3 w-3 mr-1" />}
                      {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm space-y-2 bg-muted p-4 rounded-md">
            <p><span className="text-muted-foreground">contribution</span> = max(0, income − student_loans) × 0.07</p>
            <p><span className="text-muted-foreground">total_pool</span> = Σ all contributions = <strong>${totalPool.toFixed(2)}</strong></p>
            <p><span className="text-muted-foreground">equal_share</span> = total_pool ÷ {contributions.length} participants = <strong>${equalShare.toFixed(2)}</strong></p>
            <p><span className="text-muted-foreground">net_amount</span> = equal_share − contribution</p>
            <p className="text-muted-foreground mt-2 text-xs">Positive net = you receive money. Negative net = you send money.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMathView;
