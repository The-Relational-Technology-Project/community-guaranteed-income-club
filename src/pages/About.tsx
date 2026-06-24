import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClubMark } from "@/components/Wordmark";
import { CHAPTER, ORG } from "@/lib/chapter";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const About = () => {
  const [faqItems, setFaqItems] = useState<SiteContent[]>([]);
  const [aboutItems, setAboutItems] = useState<SiteContent[]>([]);
  const [pilotStats, setPilotStats] = useState({ members: "—", moved: "—", completion: "100%", gatherings: "—" });

  useEffect(() => {
    const load = async () => {
      const { data: faq } = await supabase
        .from("site_content")
        .select("*")
        .eq("section", "faq")
        .order("sort_order");
      setFaqItems(faq ?? []);
      const { data: about } = await supabase
        .from("site_content")
        .select("*")
        .eq("section", "about")
        .order("sort_order");
      setAboutItems(about ?? []);
      const [{ count: members }, { data: txns }, { count: events }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("participant_status", "active"),
        supabase.from("transactions").select("amount, is_confirmed_sender"),
        supabase.from("events").select("id", { count: "exact", head: true }),
      ]);
      const moved = (txns ?? []).reduce((s, t) => s + Number(t.amount || 0), 0);
      const total = (txns ?? []).length;
      const confirmed = (txns ?? []).filter((t) => t.is_confirmed_sender).length;
      const pct = total > 0 ? Math.round((confirmed / total) * 100) : 100;
      setPilotStats({
        members: `${members ?? 0}`,
        moved: moved >= 1000 ? `$${Math.round(moved / 1000)}k+` : `$${moved.toFixed(0)}`,
        completion: `${pct}%`,
        gatherings: `${events ?? 0}`,
      });
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <div className="mx-auto mb-2 flex justify-center"><ClubMark size={120} /></div>
        <p className="text-xs uppercase tracking-[0.25em] text-accent mt-6 font-bold">About</p>
        <h1 className="font-display font-bold text-5xl md:text-6xl mt-3 tracking-tight">{ORG.name}</h1>
        <p className="font-serif italic text-muted-foreground mt-4 text-lg">
          A circle of neighbors carrying forward an old, old idea — starting in {CHAPTER.name}.
        </p>
      </div>

      <div className="space-y-6">
        {aboutItems.map((item) => (
          <Card key={item.id}>
            <CardHeader><CardTitle className="font-serif">{item.title}</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {item.body}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader><CardTitle className="font-serif">Pilot results</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[[pilotStats.members, "members"], [pilotStats.moved, "moved"], [pilotStats.completion, "completion"], [pilotStats.gatherings, "gatherings"]].map(([n, l]) => (
              <div key={l}>
                <p className="font-serif text-3xl text-accent">{n}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{l}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {faqItems.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="font-serif">Frequently asked questions</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left font-medium">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.body}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        <div className="text-center pt-4">
          <Link to="/signup"><Button size="lg" className="rounded-full px-8">Join the Club</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default About;
