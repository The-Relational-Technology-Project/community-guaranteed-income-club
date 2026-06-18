import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Calendar, MapPin, ExternalLink, Plus, Users } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type EventRow = Tables<"events">;
type Rsvp = { event_id: string; user_id: string; name: string | null; photo_url: string | null };

const Events = () => {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [pastEvents, setPastEvents] = useState<EventRow[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(searchParams.get("new") === "1");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    link: "",
  });

  const fetchEvents = async () => {
    const today = new Date().toISOString().split("T")[0];
    const [{ data: up }, { data: past }] = await Promise.all([
      supabase.from("events").select("*").gte("date", today).order("date").order("time"),
      supabase.from("events").select("*").lt("date", today).order("date", { ascending: false }).order("time"),
    ]);
    setEvents(up ?? []);
    setPastEvents(past ?? []);

    const { data: r } = await supabase
      .from("event_rsvps")
      .select("event_id, user_id");
    const userIds = Array.from(new Set((r ?? []).map((x) => x.user_id)));
    let nameMap = new Map<string, { name: string | null; photo_url: string | null }>();
    if (userIds.length) {
      const { data: profs } = await (supabase as any).from("members_directory").select("id, name, photo_url").in("id", userIds);
      nameMap = new Map(((profs ?? []) as Array<{ id: string; name: string | null; photo_url: string | null }>).map((p) => [p.id, { name: p.name, photo_url: p.photo_url }]));
    }
    setRsvps((r ?? []).map((x) => ({ ...x, name: nameMap.get(x.user_id)?.name ?? null, photo_url: nameMap.get(x.user_id)?.photo_url ?? null })));

    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setOpen(true);
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const eventRsvps = (id: string) => rsvps.filter((r) => r.event_id === id);
  const userIsGoing = (id: string) => !!user && eventRsvps(id).some((r) => r.user_id === user.id);

  const toggleRsvp = async (eventId: string) => {
    if (!user) return;
    if (userIsGoing(eventId)) {
      await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", user.id);
    } else {
      await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: user.id });
    }
    fetchEvents();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim() || !form.date || !form.time.trim() || !form.location.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("events").insert({
      title: form.title.trim(),
      date: form.date,
      time: form.time.trim(),
      location: form.location.trim(),
      description: form.description.trim() || null,
      link: form.link.trim() || null,
      host_name: profile?.name ?? "A member",
      created_by: user.id,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't create event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event created!" });
      setForm({ title: "", date: "", time: "", location: "", description: "", link: "" });
      setOpen(false);
      fetchEvents();
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const renderEventList = (list: EventRow[], isPast: boolean) => {
    if (list.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-3 text-primary/50" />
            {isPast ? "No past gatherings yet." : "No upcoming gatherings yet. Be the first to create one!"}
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="space-y-4">
        {list.map((evt) => {
          const attending = eventRsvps(evt.id);
          const going = userIsGoing(evt.id);
          return (
            <Card key={evt.id}>
              <CardContent className="p-6 flex flex-col md:flex-row md:items-start gap-6">
                <div className="md:w-32 text-center md:text-left">
                  <Calendar className="h-5 w-5 text-accent mx-auto md:mx-0 mb-1" />
                  <p className="font-serif text-xl leading-tight">{formatDate(evt.date).split(",")[0]}</p>
                  <p className="text-xs text-muted-foreground">{evt.time}</p>
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-2xl">{evt.title}</h2>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {evt.location} · hosted by {evt.host_name}
                  </p>
                  {evt.description && (
                    <p className="text-muted-foreground mt-3">{evt.description}</p>
                  )}
                  {evt.link && (
                    <a href={evt.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3">
                      <ExternalLink className="h-3.5 w-3.5" /> Event link
                    </a>
                  )}
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    {!isPast && (
                      <Button
                        size="sm"
                        variant={going ? "secondary" : "default"}
                        className="rounded-full"
                        onClick={() => toggleRsvp(evt.id)}
                      >
                        {going ? "✓ You're going" : "I'll be there"}
                      </Button>
                    )}
                    {attending.length > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <div className="flex -space-x-2">
                              {attending.slice(0, 4).map((a) => (
                                <Avatar key={a.user_id} className="h-6 w-6 ring-2 ring-background">
                                  <AvatarImage src={a.photo_url ?? undefined} />
                                  <AvatarFallback className="text-[10px]">{a.name?.charAt(0) ?? "?"}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {attending.length} going</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Going</p>
                          <ul className="space-y-1.5 max-h-60 overflow-y-auto">
                            {attending.map((a) => (
                              <li key={a.user_id}>
                                <a href={`/roster?member=${a.user_id}`} className="flex items-center gap-2 text-sm hover:text-primary">
                                  <Avatar className="h-6 w-6"><AvatarImage src={a.photo_url ?? undefined} /><AvatarFallback className="text-[10px]">{a.name?.charAt(0) ?? "?"}</AvatarFallback></Avatar>
                                  {a.name ?? "Member"}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif">Gatherings</h1>
          <p className="text-muted-foreground mt-2">
            We meet up every month. No pressure, just neighbors. RSVP so the host knows to make enough food.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2 shrink-0">
              <Plus className="h-4 w-4" /> New event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a gathering</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="evt-title">Title</Label>
                <Input id="evt-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sunday Coffee Hangout" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="evt-date">Date</Label>
                  <Input id="evt-date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evt-time">Time</Label>
                  <Input id="evt-time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 6:00 PM" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="evt-location">Location</Label>
                <Input id="evt-location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Patterson Park Pavilion" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evt-desc">Description</Label>
                <Textarea id="evt-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What should people know?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evt-link">Link (optional)</Label>
                <Input id="evt-link" type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
                <p className="text-xs text-muted-foreground">Zoom link, signup page, or any URL for attendees.</p>
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create gathering"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({events.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-6">
            {renderEventList(events, false)}
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            {renderEventList(pastEvents, true)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Events;
