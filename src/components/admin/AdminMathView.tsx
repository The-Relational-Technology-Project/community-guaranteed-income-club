import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, Calculator, Equal, Percent } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type CalcRun = Tables<"calculation_runs">;

interface AdminMathViewProps {
  profiles: Profile[];
  runs: CalcRun[];
}

const AdminMathView = ({ profiles, runs }: AdminMathViewProps) => {
  const [selectedRunId, setSelectedRunId] = useState<string>(runs[0]?.id ?? "preview");

  const activeProfiles = profiles.filter((p) => p.participant_status === "active");

  // Calculate the math for display
  const contributions = activeProfiles.map((p) => {
    const income = Number(p.post_tax_monthly_income ?? 0);
    const contribution = income * 0.07;
    return {
      id: p.id,
      name: p.name,
      income,
      contribution,
    };
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
    .sort((a, b) => a.net - b.net); // senders first

  const senders = breakdown.filter((b) => b.role === "sender");
  const receivers = breakdown.filter((b) => b.role === "receiver");
  const neutrals = breakdown.filter((b) => b.role === "neutral");

  return (
    <div className="space-y-6">
      {/* Algorithm Explanation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            How the Math Works
          </CardTitle>
          <CardDescription>
            Transparency into the redistribution algorithm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-medium">Collect 7%</p>
                <p className="text-muted-foreground">Each participant contributes 7% of their post-tax monthly income</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-medium">Pool the money</p>
                <p className="text-muted-foreground">All contributions go into a shared pool</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-medium">Divide equally</p>
                <p className="text-muted-foreground">The pool is divided equally among all participants</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
              <div>
                <p className="font-medium">Net difference</p>
                <p className="text-muted-foreground">If share {">"} contribution → receive. If share {"<"} contribution → send.</p>
              </div>
            </div>
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
          <CardDescription>
            Based on current active participants' income data. This is what would happen if you ran the calculation now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Monthly Income</TableHead>
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
                  <TableCell className="text-right text-muted-foreground">
                    ${row.contribution.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ${equalShare.toFixed(2)}
                  </TableCell>
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

      {/* Formula Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm space-y-2 bg-muted p-4 rounded-md">
            <p><span className="text-muted-foreground">contribution</span> = income × 0.07</p>
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
