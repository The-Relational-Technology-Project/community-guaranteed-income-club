import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";
import { Users, DollarSign, ArrowLeftRight, TrendingUp, CheckCircle, Clock, Target } from "lucide-react";
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

  // Average income of active members
  const activeProfiles = profiles.filter((p) => p.participant_status === "active");
  const avgIncome = activeProfiles.length > 0
    ? activeProfiles.reduce((sum, p) => sum + Number(p.post_tax_monthly_income ?? 0), 0) / activeProfiles.length
    : 0;

  // Pool over time chart data (sorted chronologically)
  const poolOverTime = runs
    .slice()
    .sort((a, b) => new Date(a.run_date).getTime() - new Date(b.run_date).getTime())
    .map((r) => ({
      date: new Date(r.run_date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      pool: Number(r.total_pool ?? 0),
      participants: r.participant_count ?? 0,
      avgIncome: Number(r.average_income ?? 0),
    }));

  // Cumulative redistribution
  let cumulative = 0;
  const cumulativeData = poolOverTime.map((d) => {
    cumulative += d.pool;
    return { ...d, cumulative };
  });

  // Member growth over time
  const memberGrowth = poolOverTime.map((d) => ({
    date: d.date,
    members: d.participants,
    goal: 150,
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

  // Sender vs Receiver breakdown
  const senderReceiverData = (() => {
    const senders = activeProfiles.filter((p) => Number(p.post_tax_monthly_income ?? 0) > avgIncome).length;
    const receivers = activeProfiles.filter((p) => Number(p.post_tax_monthly_income ?? 0) < avgIncome).length;
    const neutral = activeProfiles.length - senders - receivers;
    return [
      { name: "Senders", value: senders, color: "hsl(var(--accent))" },
      { name: "Receivers", value: receivers, color: "hsl(var(--fresh))" },
      ...(neutral > 0 ? [{ name: "Neutral", value: neutral, color: "hsl(var(--muted))" }] : []),
    ].filter((d) => d.value > 0);
  })();

  // Confirmation pie chart
  const confirmationData = [
    { name: "Both Confirmed", value: confirmedCount, color: "hsl(var(--primary))" },
    { name: "Sender Only", value: transactions.filter((t) => t.is_confirmed_sender && !t.is_confirmed_receiver).length, color: "hsl(var(--accent))" },
    { name: "Pending", value: transactions.filter((t) => !t.is_confirmed_sender).length, color: "hsl(var(--muted))" },
  ].filter((d) => d.value > 0);

  // Average pool per person over time
  const perPersonData = poolOverTime.map((d) => ({
    date: d.date,
    perPerson: d.participants > 0 ? Math.round(d.pool / d.participants) : 0,
  }));

  const chartConfig = {
    pool: { label: "Monthly Pool", color: "hsl(var(--primary))" },
    cumulative: { label: "Total Redistributed", color: "hsl(var(--accent))" },
    participants: { label: "Participants", color: "hsl(var(--accent))" },
    members: { label: "Members", color: "hsl(var(--primary))" },
    goal: { label: "Goal", color: "hsl(var(--muted))" },
    count: { label: "Members", color: "hsl(var(--primary))" },
    perPerson: { label: "Per Person", color: "hsl(var(--fresh))" },
    avgIncome: { label: "Avg Income", color: "hsl(var(--warm))" },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { icon: Users, color: "text-primary", value: activeCount, label: "Active" },
          { icon: Clock, color: "text-muted-foreground", value: waitlistedCount, label: "Waitlisted" },
          { icon: Users, color: "text-muted-foreground", value: totalMembers, label: "Total" },
          { icon: DollarSign, color: "text-primary", value: `$${totalRedistributed.toLocaleString()}`, label: "Redistributed" },
          { icon: DollarSign, color: "text-primary", value: `$${avgIncome.toFixed(0)}`, label: "Avg Income" },
          { icon: ArrowLeftRight, color: "text-primary", value: runs.length, label: "Runs" },
          { icon: Target, color: "text-accent", value: "150", label: "Goal" },
          { icon: CheckCircle, color: "text-primary", value: `${confirmationRate}%`, label: "Confirmed" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <div>
                  <p className="text-lg font-bold leading-tight">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Growth + Cumulative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {memberGrowth.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Member Growth vs Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px]">
                <AreaChart data={memberGrowth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="members" stroke="var(--color-members)" fill="var(--color-members)" fillOpacity={0.15} strokeWidth={2} />
                  <Line type="monotone" dataKey="goal" stroke="var(--color-goal)" strokeDasharray="6 3" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {cumulativeData.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cumulative Redistribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px]">
                <AreaChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="cumulative" stroke="var(--color-cumulative)" fill="var(--color-cumulative)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Row 2: Pool per month + Per person share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {poolOverTime.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monthly Pool Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px]">
                <BarChart data={poolOverTime}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pool" fill="var(--color-pool)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {perPersonData.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Equal Share Per Person (Monthly)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px]">
                <LineChart data={perPersonData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="perPerson" stroke="var(--color-perPerson)" strokeWidth={2} dot />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Row 3: Income Distribution + Sender/Receiver + Confirmations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Income Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px]">
              <BarChart data={incomeDistribution}>
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {senderReceiverData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Senders vs Receivers
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <div className="h-[220px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={senderReceiverData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} label={({ name, value }) => `${name}: ${value}`}>
                      {senderReceiverData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {confirmationData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Payment Confirmations
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <div className="h-[220px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={confirmationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} label={({ name, value }) => `${name}: ${value}`}>
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
