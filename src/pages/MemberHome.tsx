import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { mockEvents, mockBoardPosts, waysToShowUp } from "@/data/mockMember";
import { Calendar, MessageSquare, Heart, ArrowRight, Coffee, MapPin, Check } from "lucide-react";

type TxnRow = {
  id: string;
  amount: number;
  is_confirmed_sender: boolean | null;
  receiver: { id: string; name: string; photo_url: string | null; favorite_third_space: string | null; venmo_handle: string | null; zelle_info: string | null } | null;
};

type LastReceived = {
  id: string;
  amount: number;
  sender: { name: string; photo_url: string | null } | null;
};

const MemberHome = () => {
  const { user, profile } = useAuth();
  const [thisMonth, setThisMonth] = useState<TxnRow | null>(null);
  const [lastMonth, setLastMonth] = useState<LastReceived | null>(null);
  const [networkCount, setNetworkCount] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  const firstName = profile?.name?.split(" ")[0] ?? "friend";
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // This month: find latest run, find sender txn for this user
      const { data: runs } = await supabase
        .from("calculation_runs")
        .select("id, run_date")
        .order("run_date", { ascending: false })
        .limit(2);

      if (runs && runs.length > 0) {
        const { data: send } = await supabase
          .from("transactions")
          .select("id, amount, is_confirmed_sender, receiver:profiles!transactions_receiver_id_fkey(id, name, photo_url, favorite_third_space, venmo_handle, zelle_info)")
          .eq("run_id", runs[0].id)
          .eq("sender_id", user.id)
          .maybeSingle();
        setThisMonth(send as any);

        if (runs[1]) {
          const { data: recv } = await supabase
            .from("transactions")
            .select("id, amount, sender:profiles!transactions_sender_id_fkey(name, photo_url)")
            .eq("run_id", runs[1].id)
            .eq("receiver_id", user.id)
            .maybeSingle();
          setLastMonth(recv as any);
        }
      }

      // Network: distinct counterparties
      const { data: all } = await supabase
        .from("transactions")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      const ids = new Set<string>();
      (all ?? []).forEach((t) => {
        if (t.sender_id !== user.id) ids.add(t.sender_id);
        if (t.receiver_id !== user.id) ids.add(t.receiver_id);
      });
      setNetworkCount(ids.size);
      setLoading(false);
    };
    load();
  }, [user]);

  const confirmSend = async () => {
    if (!thisMonth) return;
    const update: Record<string, any> = {
      is_confirmed_sender: true,
      confirmed_sender_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("transactions").update(update).eq("id", thisMonth.id);
    if (error) {
      toast({ title: "Couldn't update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marked as sent — thank you 💛" });
      setThisMonth({ ...thisMonth, is_confirmed_sender: true });
    }
  };

  const venmoLink = thisMonth?.receiver?.venmo_handle
    ? `https://venmo.com/${thisMonth.receiver.venmo_handle.replace(/^@/, "")}?txn=pay&amount=${thisMonth.amount}&note=${encodeURIComponent(note || "Mutualist Club")}`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-10">
      {/* Greeting */}
      <header>
        <p className="text-sm text-muted-foreground uppercase tracking-wider">{monthLabel} · 50 members strong</p>
        <h1 className="text-4xl md:text-5xl font-serif mt-2">Hey, {firstName}.</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Here's what's moving through the club this month, and a few small ways to show up.
        </p>
      </header>

      {/* This month's connection */}
      <section>
        <h2 className="text-xl font-serif mb-3">Your connection this month</h2>
        {loading ? (
          <Card><CardContent className="p-6 text-muted-foreground">Loading…</CardContent></Card>
        ) : thisMonth && thisMonth.receiver ? (
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-16 w-16 ring-2 ring-accent/40">
                    <AvatarImage src={thisMonth.receiver.photo_url ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {thisMonth.receiver.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">You're sending to</p>
                    <p className="font-serif text-2xl">{thisMonth.receiver.name}</p>
                    {thisMonth.receiver.favorite_third_space && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <Coffee className="h-3.5 w-3.5" />
                        favorite spot: {thisMonth.receiver.favorite_third_space}
                      </p>
                    )}
                    <p className="text-3xl font-serif text-primary mt-3">${Number(thisMonth.amount).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="text-sm text-muted-foreground">
                  Add a note — a small victory, a question about their favorite spot, anything human.
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Finally finished the garden bed this week — what's your favorite Baltimore coffee?"
                  rows={2}
                />
                <div className="flex flex-wrap gap-2">
                  {venmoLink && (
                    <a href={venmoLink} target="_blank" rel="noreferrer">
                      <Button className="rounded-full">Send via Venmo</Button>
                    </a>
                  )}
                  {thisMonth.receiver.zelle_info && (
                    <Button variant="outline" className="rounded-full">Zelle: {thisMonth.receiver.zelle_info}</Button>
                  )}
                  {thisMonth.is_confirmed_sender ? (
                    <Badge className="bg-success text-success-foreground rounded-full px-3 py-1.5">
                      <Check className="h-3.5 w-3.5 mr-1" /> Sent
                    </Badge>
                  ) : (
                    <Button variant="secondary" onClick={confirmSend} className="rounded-full">
                      I've sent this
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Heart className="h-8 w-8 mx-auto mb-3 text-primary/50" />
              No assignment yet for this month — the steward will run the math on the 1st.
            </CardContent>
          </Card>
        )}
      </section>

      {/* Last month */}
      {lastMonth && lastMonth.sender && (
        <section>
          <h2 className="text-xl font-serif mb-3">Last month, support arrived from</h2>
          <Card className="bg-secondary/50 border-l-4 border-accent">
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={lastMonth.sender.photo_url ?? undefined} />
                <AvatarFallback>{lastMonth.sender.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-serif text-lg italic">"{lastMonth.sender.name} showed up for you with ${Number(lastMonth.amount).toFixed(0)}."</p>
                <p className="text-sm text-muted-foreground">Maybe say thanks at the next gathering.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Upcoming gatherings */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-serif">Upcoming gatherings</h2>
          <Link to="/events" className="text-sm text-primary hover:underline">All events →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {mockEvents.map((e) => (
            <Card key={e.id} className="hover-pop">
              <CardContent className="p-5">
                <Calendar className="h-5 w-5 text-accent mb-2" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{e.date} · {e.time}</p>
                <h3 className="font-serif text-lg mt-1 leading-tight">{e.title}</h3>
                <p className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-3 w-3" /> {e.location}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{e.attendees} going</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Ways to show up */}
      <section>
        <h2 className="text-xl font-serif mb-1">Small ways to show up</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The club is more than money. Here are tiny, real things you can do this week.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {waysToShowUp.map((w) => (
            <Card key={w.id} className="hover-pop">
              <CardContent className="p-5">
                <h3 className="font-serif text-lg">{w.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{w.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 -ml-3 text-primary"
                  onClick={() => toast({ title: w.cta, description: "We'll connect you — thank you for showing up." })}
                >
                  {w.cta} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Board preview */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-serif">Offers & needs board</h2>
          <Link to="/board" className="text-sm text-primary hover:underline">Full board →</Link>
        </div>
        <div className="space-y-3">
          {mockBoardPosts.slice(0, 3).map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex gap-3">
                <Badge
                  variant="secondary"
                  className={`uppercase text-[10px] tracking-wider self-start ${
                    p.type === "offer" ? "bg-success/15 text-success" :
                    p.type === "need" ? "bg-warm/15 text-warm" :
                    "bg-accent/20 text-accent-foreground"
                  }`}
                >
                  {p.type}
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">— {p.author}, {p.posted}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Network */}
      <section>
        <Card className="card-gradient text-primary-foreground">
          <CardContent className="p-6 flex items-center gap-4">
            <MessageSquare className="h-8 w-8 text-accent" />
            <div className="flex-1">
              <p className="text-sm opacity-80">Your network in the club</p>
              <p className="font-serif text-2xl">
                You've exchanged support with {networkCount} {networkCount === 1 ? "neighbor" : "neighbors"}.
              </p>
            </div>
            <Link to="/roster">
              <Button variant="secondary" className="rounded-full">See the roster</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default MemberHome;
