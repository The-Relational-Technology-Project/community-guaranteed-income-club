import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, ExternalLink, DollarSign } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Transaction = Tables<"transactions">;
type Profile = Tables<"profiles">;

interface TransactionWithProfiles extends Transaction {
  sender: Profile;
  receiver: Profile;
}

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;

    // Fetch transactions where user is sender or receiver
    const { data: txns } = await supabase
      .from("transactions")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!txns || txns.length === 0) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    // Collect unique profile IDs
    const profileIds = [...new Set(txns.flatMap((t) => [t.sender_id, t.receiver_id]))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", profileIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const enriched = txns
      .map((t) => ({
        ...t,
        sender: profileMap.get(t.sender_id)!,
        receiver: profileMap.get(t.receiver_id)!,
      }))
      .filter((t) => t.sender && t.receiver);

    setTransactions(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const confirmTransaction = async (txnId: string, role: "sender" | "receiver") => {
    const field = role === "sender" ? "is_confirmed_sender" : "is_confirmed_receiver";
    const timeField = role === "sender" ? "confirmed_sender_at" : "confirmed_receiver_at";

    const { error } = await supabase
      .from("transactions")
      .update({ [field]: true, [timeField]: new Date().toISOString() })
      .eq("id", txnId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Confirmed!" });
      fetchTransactions();
    }
  };

  const buildVenmoLink = (handle: string | null, amount: number) => {
    if (!handle) return null;
    const cleanHandle = handle.replace("@", "");
    return `https://venmo.com/${cleanHandle}?txn=pay&amount=${amount}&note=Baltimore%20Community%20GI%20Program`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">My Transactions</h1>
      <p className="text-muted-foreground mb-8">
        Your personalized send/receive assignments for each redistribution cycle.
      </p>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No transactions yet.</p>
            <p className="text-sm">Transactions will appear here after the next redistribution cycle runs.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => {
            const isSender = txn.sender_id === user?.id;
            const otherPerson = isSender ? txn.receiver : txn.sender;
            const isConfirmed = isSender ? txn.is_confirmed_sender : txn.is_confirmed_receiver;
            const venmoLink = isSender ? buildVenmoLink(otherPerson.venmo_handle, txn.amount) : null;

            return (
              <Card key={txn.id} className={isConfirmed ? "opacity-70" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 flex-shrink-0">
                      <AvatarImage src={otherPerson.photo_url ?? undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {otherPerson.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={isSender ? "destructive" : "default"}>
                          {isSender ? "Send" : "Receive"}
                        </Badge>
                        <span className="text-2xl font-bold">${txn.amount.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {isSender ? (
                          <span className="flex items-center gap-1">
                            You <ArrowRight className="h-3 w-3" /> {otherPerson.name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {otherPerson.name} <ArrowRight className="h-3 w-3" /> You
                          </span>
                        )}
                      </p>
                      {otherPerson.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{otherPerson.bio}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isSender && venmoLink && (
                        <a href={venmoLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Venmo
                          </Button>
                        </a>
                      )}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={!!isConfirmed}
                          disabled={!!isConfirmed}
                          onCheckedChange={() => confirmTransaction(txn.id, isSender ? "sender" : "receiver")}
                        />
                        <span className="text-xs text-muted-foreground">
                          {isConfirmed ? "Confirmed" : "Mark done"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Transactions;
