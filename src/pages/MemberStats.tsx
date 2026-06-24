import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, AreaChart, Area, CartesianGrid } from "recharts";
import { Users, DollarSign, TrendingUp, Target } from "lucide-react";

type Run = { id: string; run_date: string; total_pool: number | null; participant_count: number | null; average_income: number | null };

const MemberStats = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [waitlistedCount, setWaitlistedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: r }, { count: ac }, { count: wc }] = await Promise.all([
        supabase.from("calculation_runs").select("id, run_date, total_pool, participant_count, average_income").order("run_date"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("participant_status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("participant_status", "waitlisted"),
      ]);
      setRuns((r ?? []) as any);
      setActiveCount(ac ?? 0);
      setWaitlistedCount(wc ?? 0);
      setLoading(false);
    })();
  }, []);

  const totalRedistributed = runs.reduce((s, r) => s + Number(r.total_pool ?? 0), 0);
  const lastRun = runs[runs.length - 1];
  const series = runs.map((r) => ({
    date: new Date(r.run_date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    pool: Number(r.total_pool ?? 0),
    members: r.participant_count ?? 0,
    perPerson: r.participant_count ? Math.round(Number(r.total_pool ?? 0) / r.participant_count) : 0,
  }));
  let cum = 0;
  const cumulative = series.map((d) => ({ ...d, cumulative: (cum += d.pool) }));

  const chartConfig = {
    pool: { label: "Monthly Pool", color: "hsl(var(--primary))" },
    cumulative: { label: "Total Redistributed", color: "hsl(var(--accent))" },
    members: { label: "Members", color: "hsl(var(--primary))" },
    perPerson: { label: "Per Person", color: "hsl(var(--fresh))" },
    goal: { label: "Goal", color: "hsl(var(--muted))" },
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const kpis = [
    { icon: Users, value: activeCount, label: "Active members" },
    { icon: Users, value: waitlistedCount, label: "Waitlisted" },
    { icon: DollarSign, value: `$${totalRedistributed.toLocaleString()}`, label: "Total redistributed" },
    { icon: TrendingUp, value: lastRun ? `$${Number(lastRun.total_pool ?? 0).toLocaleString()}` : "—", label: "Last month's pool" },
    { icon: Target, value: "150", label: "Chapter goal" },
    { icon: DollarSign, value: lastRun ? `$${Number(lastRun.average_income ?? 0).toFixed(0)}` : "—", label: "Avg. monthly income" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-serif">Club Stats</h1>
        <p className="text-muted-foreground mt-1">A live look at how the math is working — what we're moving together, and how we're growing.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {kpis.map((k, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <k.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-bold leading-tight">{k.value}</p>
                  <p className="text-[10px] text-muted-foreground">{k.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {series.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Member growth</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px]">
                <AreaChart data={series.map((d) => ({ ...d, goal: 150 }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="members" stroke="var(--color-members)" fill="var(--color-members)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Cumulative redistribution</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px]">
                <AreaChart data={cumulative}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="cumulative" stroke="var(--color-cumulative)" fill="var(--color-cumulative)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Monthly pool size</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px]">
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pool" fill="var(--color-pool)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Equal share per person</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px]">
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="perPerson" fill="var(--color-perPerson)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-8">
        These numbers are aggregate only — individual incomes, payments, and identities aren't shown here.
      </p>
    </div>
  );
};

export default MemberStats;