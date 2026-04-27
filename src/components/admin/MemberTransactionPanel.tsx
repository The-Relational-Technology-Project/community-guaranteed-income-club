import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type CalcRun = Tables<"calculation_runs">;
type Transaction = Tables<"transactions">;

interface Props {
  memberId: string;
  profileMap: Map<string, Profile>;
  runMap: Map<string, CalcRun>;
}

const MemberTransactionPanel = ({ memberId, profileMap, runMap }: Props) => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .or(`sender_id.eq.${memberId},receiver_id.eq.${memberId}`)
        .order("created_at", { ascending: false });
      if (active) {
        setTxns(data ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [memberId]);

  if (loading) {
    return <div className="py-4 text-sm text-muted-foreground">Loading history…</div>;
  }

  const sent = txns.filter((t) => t.sender_id === memberId);
  const received = txns.filter((t) => t.receiver_id === memberId);

  const sentTotal = sent.reduce((s, t) => s + Number(t.amount), 0);
  const receivedTotal = received.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 py-2">
      <Column
        title="Sent"
        total={sentTotal}
        items={sent}
        counterpartyKey="receiver_id"
        profileMap={profileMap}
        runMap={runMap}
        emptyText="No sends yet"
      />
      <Column
        title="Received"
        total={receivedTotal}
        items={received}
        counterpartyKey="sender_id"
        profileMap={profileMap}
        runMap={runMap}
        emptyText="No receipts yet"
      />
    </div>
  );
};

interface ColProps {
  title: string;
  total: number;
  items: Transaction[];
  counterpartyKey: "sender_id" | "receiver_id";
  profileMap: Map<string, Profile>;
  runMap: Map<string, CalcRun>;
  emptyText: string;
}

const Column = ({ title, total, items, counterpartyKey, profileMap, runMap, emptyText }: ColProps) => (
  <div className="rounded-md border bg-card">
    <div className="flex items-center justify-between px-3 py-2 border-b">
      <span className="font-medium text-sm">{title}</span>
      <span className="text-sm tabular-nums">${total.toFixed(2)}</span>
    </div>
    <div className="divide-y">
      {items.length === 0 && (
        <div className="px-3 py-4 text-xs text-muted-foreground">{emptyText}</div>
      )}
      {items.map((t) => {
        const other = profileMap.get(t[counterpartyKey] as string);
        const run = runMap.get(t.run_id);
        return (
          <div key={t.id} className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={other?.photo_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {other?.name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{other?.name ?? "Unknown"}</div>
              <div className="text-xs text-muted-foreground">
                {run ? new Date(run.run_date).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : new Date(t.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-medium tabular-nums">${Number(t.amount).toFixed(2)}</span>
              <div className="flex gap-1">
                <Badge variant={t.is_confirmed_sender ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                  S {t.is_confirmed_sender ? "✓" : "•"}
                </Badge>
                <Badge variant={t.is_confirmed_receiver ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                  R {t.is_confirmed_receiver ? "✓" : "•"}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default MemberTransactionPanel;