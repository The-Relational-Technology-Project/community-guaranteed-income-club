import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, DollarSign, ArrowLeftRight, TrendingUp, CheckCircle, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type CalcRun = Tables<"calculation_runs">;

interface Transaction {
  id: string;
  amount: number;
  is_confirmed_sender: boolean | null;
  is_confirmed_receiver: boolean | null;
  run_id: string;
  created_at: string;
}

interface AdminKPIDashboardProps {
  profiles: Profile[];
  runs: CalcRun[];
  transactions: Transaction[];
}

const AdminKPIDashboard = ({ profiles, runs, transactions }: AdminKPIDashboardProps) => {
  const activeCount = profiles.filter((p) => p.participant_status === "active").length;
  const waitlistedCount = profiles.filter((p) => p.participant_status === "waitlisted").length;
  const totalMembers = profiles.length;

  const totalRedistributed = runs.reduce((sum, r) => sum + Number(r.total_pool ?? 0), 0);
  const totalTransactions = transactions.length;
  const confirmedCount = transactions.filter((t) => t.is_confirmed_sender && t.is_confirmed_receiver).length;
  const confirmationRate = totalTransactions > 0 ? Math.round((confirmedCount / totalTransactions) * 100) : 0;

  // Pool over time chart data
  const poolOverTime = runs
    .slice()
    .reverse()
    .map((r) => ({
      date: new Date(r.run_date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      pool: Number(r.total_pool ?? 0),
      participants: r.participant_count ?? 0,
    }));

  // Income distribution
  const incomeRanges = [
    { label: "$0–1k", min: 0, max: 1000 },
    { label: "$1k–2k", min: 1000, max: 2000 },
    { label: "$2k–3k", min: 2000, max: 3000 },
    { label: "$3k–4k", min: 3000, max: 4000 },
    { label: "$4k–5k", min: 4000, max: 5000 },
    { label: "$5k+", min: 5000, max: Infinity },
  ];

  const incomeDistribution = incomeRanges.map((range) => ({
    range: range.label,
    count: profiles.filter((p) => {
      const income = Number(p.post_tax_monthly_income ?? 0);
      return income >= range.min && income < range.max;
    }).length,
  }));

  // Confirmation pie chart
  const confirmationData = [
    { name: "Both Confirmed", value: confirmedCount, color: "hsl(var(--primary))" },
    { name: "Sender Only", value: transactions.filter((t) => t.is_confirmed_sender && !t.is_confirmed_receiver).length, color: "hsl(var(--accent))" },
    { name: "Pending", value: transactions.filter((t) => !t.is_confirmed_sender).length, color: "hsl(var(--muted))" },
  ].filter((d) => d.value > 0);

  const chartConfig = {
    pool: { label: "Total Pool", color: "hsl(var(--primary))" },
    participants: { label: "Participants", color: "hsl(var(--accent))" },
    count: { label: "Members", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{waitlistedCount}</p>
                <p className="text-xs text-muted-foreground">Waitlisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalMembers}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">${totalRedistributed.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Given</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">{runs.length}</p>
                <p className="text-xs text-muted-foreground">Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">{confirmationRate}%</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pool Over Time */}
        {poolOverTime.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Redistribution Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <LineChart data={poolOverTime}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="pool" stroke="var(--color-pool)" strokeWidth={2} dot />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Income Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Income Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={incomeDistribution}>
                <XAxis dataKey="range" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Confirmation Status */}
        {confirmationData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Payment Confirmation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-[250px] w-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={confirmationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                      {confirmationData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminKPIDashboard;
