import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import crest from "@/assets/crest.png";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <img src={crest} alt="Baltimore Mutualist Club crest" className="h-48 w-48 md:h-64 md:w-64 mx-auto rounded-full ring-2 ring-accent/40 bg-card object-cover shadow-lg" />
        <p className="text-xs uppercase tracking-[0.25em] text-accent mt-6">About</p>
        <h1 className="font-serif text-5xl mt-3">The Baltimore Mutualist Club</h1>
        <p className="font-serif italic text-muted-foreground mt-4">
          A circle of neighbors carrying forward an old, old idea.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="font-serif">Our story</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We started in April 2025, after watching peers lose jobs in global health and federal work.
              A handful of us pooled a small percentage of our income each month and sent it directly to whoever
              needed it most.
            </p>
            <p>
              That pilot ran for 20 people without a single hiccup. Today we're 50+ members and growing —
              with a goal of 150 by the end of the year.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-serif">How it works</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Every member contributes <strong className="text-foreground">7% of their post-tax monthly income</strong>.
              That money is divided equally across the club — those above the average send, those below receive.
            </p>
            <p>
              Payments go <strong className="text-foreground">directly</strong> from neighbor to neighbor via Venmo or Zelle.
              No pool. No overhead. The club is the people, not the platform.
            </p>
            <p>
              Research shows the most effective anti-poverty tool is direct cash, no strings.
              An extra $100–$200/month is groceries, gas, the dentist, breathing room.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-serif">Beyond the money</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Money is the easiest currency to count, but it's not the only one we trade.
              We host monthly gatherings — potlucks, skill shares, Sunday coffee.
              We have a board for offers and needs. We welcome new members in person.
            </p>
            <p className="font-serif italic text-foreground">
              "All flourishing is mutual." — Robin Wall Kimmerer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-serif">Pilot results</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[["50+", "members"], ["$23k+", "moved"], ["100%", "completion"], ["12+", "gatherings"]].map(([n, l]) => (
              <div key={l}>
                <p className="font-serif text-3xl text-accent">{n}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{l}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="text-center pt-4">
          <Link to="/signup"><Button size="lg" className="rounded-full px-8">Join the Club</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default About;
