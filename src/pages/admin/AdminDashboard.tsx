import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Calculator, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AdminKPIDashboard from "@/components/admin/AdminKPIDashboard";
import AdminMembersTab from "@/components/admin/AdminMembersTab";
import AdminMathView from "@/components/admin/AdminMathView";
import AdminEmailsTab from "@/components/admin/AdminEmailsTab";
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

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [runs, setRuns] = useState<CalcRun[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [{ data: p }, { data: r }, { data: t }] = await Promise.all([
      supabase.from("profiles").select("*").order("name"),
      supabase.from("calculation_runs").select("*").order("run_date", { ascending: false }).limit(20),
      supabase.from("transactions").select("id, amount, is_confirmed_sender, is_confirmed_receiver, run_id, created_at").order("created_at", { ascending: false }),
    ]);
    setProfiles(p ?? []);
    setRuns(r ?? []);
    setTransactions((t as Transaction[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-2 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">Demo steward controls</p>
            <p className="text-sm text-muted-foreground">
              KPIs and member management are live, the monthly math creates real assignments, and the email tab is a safe template editor/preview for demos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{profiles.length} members</span>
            <span>•</span>
            <span>{runs.length} runs</span>
            <span>•</span>
            <span>{transactions.length} transactions</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="kpi" className="space-y-6">
        <TabsList className="grid h-auto w-full max-w-2xl grid-cols-2 gap-2 rounded-lg bg-transparent p-0 md:grid-cols-4">
          <TabsTrigger value="kpi" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">KPIs</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="math" className="gap-1.5">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Math</span>
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-1.5">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Emails</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpi">
          <AdminKPIDashboard profiles={profiles} runs={runs} transactions={transactions} />
        </TabsContent>

        <TabsContent value="members">
          <AdminMembersTab profiles={profiles} runs={runs} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="math">
          <AdminMathView profiles={profiles} runs={runs} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="emails">
          <AdminEmailsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
