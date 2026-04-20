import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockEvents } from "@/data/mockMember";
import { toast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users } from "lucide-react";

const Events = () => {
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});

  const toggle = (id: string, title: string) => {
    setRsvps((r) => {
      const next = { ...r, [id]: !r[id] };
      toast({ title: next[id] ? "You're in" : "RSVP removed", description: title });
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-serif">Gatherings</h1>
        <p className="text-muted-foreground mt-2">
          We meet up every month. No pressure, just neighbors. RSVP so the host knows to make enough food.
        </p>
        <Badge variant="secondary" className="mt-3 text-[10px] uppercase tracking-widest">demo data</Badge>
      </header>

      <div className="space-y-4">
        {mockEvents.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-6 flex flex-col md:flex-row md:items-start gap-6">
              <div className="md:w-32 text-center md:text-left">
                <Calendar className="h-5 w-5 text-accent mx-auto md:mx-0 mb-1" />
                <p className="font-serif text-xl leading-tight">{e.date.split(",")[0]}</p>
                <p className="text-xs text-muted-foreground">{e.time}</p>
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-2xl">{e.title}</h2>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {e.location} · hosted by {e.host}
                </p>
                <p className="text-muted-foreground mt-3">{e.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> {e.attendees + (rsvps[e.id] ? 1 : 0)} going
                  </span>
                  <Button
                    onClick={() => toggle(e.id, e.title)}
                    variant={rsvps[e.id] ? "secondary" : "default"}
                    className="rounded-full"
                  >
                    {rsvps[e.id] ? "You're going ✓" : "RSVP"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Events;
