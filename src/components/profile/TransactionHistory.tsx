import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { confirmTransactionSide } from "@/lib/confirmTransaction";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Transaction = Tables<"transactions">;

interface Props {
  userId: string;
}

const TransactionHistory = ({ userId }: Props) => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [profileMap, setProfileMap] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: t } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    const list = t ?? [];
    const ids = [...new Set(list.flatMap((x) => [x.sender_id, x.receiver_id]))];
    if (ids.length) {
      const { data: p } = await (supabase as any)
        .from("members_directory")
        .select("id, name, photo_url")
        .in("id", ids);
      setProfileMap(new Map(((p ?? []) as any[]).map((x) => [x.id, x])));
    }
    setTxns(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const confirm = async (id: string, role: "sender" | "receiver") => {
    const { error } = await confirmTransactionSide(id, role);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Confirmed!" });
      load();
    }
  };

  if (loading) return null;

  const sent = txns.filter((t) => t.sender_id === userId);
  const received = txns.filter((t) => t.receiver_id === userId);
  const sentTotal = sent.reduce((s, t) => s + Number(t.amount), 0);
  const receivedTotal = received.reduce((s, t) => s + Number(t.amount), 0);

  const months = new Set(
    txns.map((t) => new Date(t.created_at).toISOString().slice(0, 7))
  ).size;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Your transaction history</CardTitle>
        <CardDescription>
          Sent ${sentTotal.toFixed(2)} · Received ${receivedTotal.toFixed(2)} · {months} month{months === 1 ? "" : "s"} participating
        </CardDescription>
      </CardHeader>
      <CardContent>
        {txns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Section
              title="You sent"
              items={sent}
              counterpartyKey="receiver_id"
              profileMap={profileMap}
              userId={userId}
              onConfirm={confirm}
              role="sender"
            />
            <Section
              title="You received"
              items={received}
              counterpartyKey="sender_id"
              profileMap={profileMap}
              userId={userId}
              onConfirm={confirm}
              role="receiver"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SectionProps {
  title: string;
  items: Transaction[];
  counterpartyKey: "sender_id" | "receiver_id";
  profileMap: Map<string, Profile>;
  userId: string;
  onConfirm: (id: string, role: "sender" | "receiver") => void;
  role: "sender" | "receiver";
}

const Section = ({ title, items, counterpartyKey, profileMap, onConfirm, role }: SectionProps) => (
  <div className="rounded-md border">
    <div className="px-3 py-2 border-b font-medium text-sm">{title}</div>
    <div className="divide-y">
      {items.length === 0 && (
        <div className="px-3 py-3 text-xs text-muted-foreground">Nothing here yet.</div>
      )}
      {items.map((t) => {
        const other = profileMap.get(t[counterpartyKey] as string);
        const myConfirmed = role === "sender" ? t.is_confirmed_sender : t.is_confirmed_receiver;
        return (
          <div key={t.id} className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={other?.photo_url ?? undefined} />
              <AvatarFallback className="text-xs">{other?.name?.charAt(0) ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{other?.name ?? "Unknown"}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </div>
            </div>
            <span className="text-sm font-medium tabular-nums">${Number(t.amount).toFixed(2)}</span>
            {myConfirmed ? (
              <Badge variant="default" className="text-[10px]">✓</Badge>
            ) : (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onConfirm(t.id, role)}>
                Mark {role === "sender" ? "sent" : "received"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default TransactionHistory;