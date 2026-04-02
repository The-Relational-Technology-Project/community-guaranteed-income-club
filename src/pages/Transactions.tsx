import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, ExternalLink, DollarSign, Heart, Coffee, MapPin, Handshake } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Transaction = Tables<"transactions">;
type Profile = Tables<"profiles">;

interface TransactionWithProfiles extends Omit<Transaction, 'sender_open_to_meet' | 'receiver_open_to_meet'> {
  sender: Profile & { favorite_third_space?: string | null; open_to_in_person?: boolean };
  receiver: Profile & { favorite_third_space?: string | null; open_to_in_person?: boolean };
  sender_open_to_meet?: boolean;
  receiver_open_to_meet?: boolean;
}

const CONNECTION_PROMPTS = [
  "Include a note in your Venmo about a small victory you had this week ✨",
  "Ask them about their favorite spot in Baltimore 🏙️",
  "Share something you're grateful for this month 🙏",
  "Tell them about a local event you're excited about 🎉",
  "Ask what neighborhood gem they've discovered lately 🗺️",
  "Share a book, podcast, or recipe you've been enjoying 📖",
  "Ask how their week has been going — you might make their day 💛",
];

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [venmoDialogTxn, setVenmoDialogTxn] = useState<TransactionWithProfiles | null>(null);

  const fetchTransactions = async () => {
    if (!user) return;

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

    const profileIds = [...new Set(txns.flatMap((t) => [t.sender_id, t.receiver_id]))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*, favorite_third_space, open_to_in_person")
      .in("id", profileIds);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    const enriched = txns
      .map((t: any) => ({
        ...t,
        sender: profileMap.get(t.sender_id)!,
        receiver: profileMap.get(t.receiver_id)!,
      }))
      .filter((t: any) => t.sender && t.receiver);

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

  const toggleMeetOpt = async (txnId: string, role: "sender" | "receiver") => {
    const field = role === "sender" ? "sender_open_to_meet" : "receiver_open_to_meet";
    const txn = transactions.find((t) => t.id === txnId);
    if (!txn) return;
    const current = role === "sender" ? (txn as any).sender_open_to_meet : (txn as any).receiver_open_to_meet;

    const { error } = await supabase
      .from("transactions")
      .update({ [field]: !current } as any)
      .eq("id", txnId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: !current ? "You're open to meeting in person! 🤝" : "In-person preference removed" });
      fetchTransactions();
    }
  };

  const buildVenmoLink = (handle: string | null, amount: number) => {
    if (!handle) return null;
    const cleanHandle = handle.replace("@", "");
    return `https://venmo.com/${cleanHandle}?txn=pay&amount=${amount}&note=Baltimore%20Community%20GI%20Program`;
  };

  const getConnectionPrompt = (txnId: string) => {
    // Deterministic prompt based on txn id
    let hash = 0;
    for (let i = 0; i < txnId.length; i++) {
      hash = ((hash << 5) - hash + txnId.charCodeAt(i)) | 0;
    }
    return CONNECTION_PROMPTS[Math.abs(hash) % CONNECTION_PROMPTS.length];
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
            const myMeetOpt = isSender ? (txn as any).sender_open_to_meet : (txn as any).receiver_open_to_meet;
            const theirMeetOpt = isSender ? (txn as any).receiver_open_to_meet : (txn as any).sender_open_to_meet;
            const bothWantToMeet = myMeetOpt && theirMeetOpt;
            const thirdSpace = (otherPerson as any).favorite_third_space;

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
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => setVenmoDialogTxn(txn)}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Venmo
                        </Button>
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

                  {/* In-person meetup opt-in */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={!!myMeetOpt}
                          onCheckedChange={() => toggleMeetOpt(txn.id, isSender ? "sender" : "receiver")}
                        />
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Handshake className="h-3 w-3" />
                          I'm open to doing this exchange in person
                        </span>
                      </div>
                      {theirMeetOpt && !myMeetOpt && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Heart className="h-3 w-3" /> {otherPerson.name} is open to meeting!
                        </Badge>
                      )}
                    </div>

                    {bothWantToMeet && (
                      <div className="mt-2 rounded-md bg-primary/5 border border-primary/20 p-3">
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Heart className="h-4 w-4 text-primary" />
                          You both want to meet in person! 🎉
                        </p>
                        {thirdSpace && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Coffee className="h-3 w-3" />
                            {otherPerson.name} suggests: <span className="font-medium">{thirdSpace}</span>
                          </p>
                        )}
                        {otherPerson.zip_code && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            They're in {otherPerson.zip_code}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Connection prompt dialog when clicking Venmo */}
      <Dialog open={!!venmoDialogTxn} onOpenChange={(open) => !open && setVenmoDialogTxn(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Before you send...
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {venmoDialogTxn && getConnectionPrompt(venmoDialogTxn.id)}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground">
            <p>This community is built on real relationships. A small note in your Venmo payment can turn a transaction into a connection. 💛</p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setVenmoDialogTxn(null)}>
              Maybe later
            </Button>
            {venmoDialogTxn && (
              <a
                href={buildVenmoLink(
                  (venmoDialogTxn.receiver as any).venmo_handle,
                  venmoDialogTxn.amount
                ) ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setVenmoDialogTxn(null)}
              >
                <Button className="w-full gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Open Venmo with love
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
