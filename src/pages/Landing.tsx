import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart, MessageCircle, Calendar, Check } from "lucide-react";
import crest from "@/assets/crest.png";

const Landing = () => {
  const [myIncome, setMyIncome] = useState("");
  const [groupAvg, setGroupAvg] = useState("2800");

  const myIncomeNum = Number(myIncome) || 0;
  const groupAvgNum = Number(groupAvg) || 2800;
  const myContribution = myIncomeNum * 0.07;
  const equalShare = groupAvgNum * 0.07;
  const net = equalShare - myContribution;
  const hasResult = myIncomeNum > 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 pattern-dots opacity-40 pointer-events-none" />
        <div className="container mx-auto max-w-5xl px-4 pt-16 md:pt-24 pb-16 relative">
          <div className="text-center">
            <img src={crest} alt="Baltimore Mutualist Club crest" className="h-24 w-24 md:h-28 md:w-28 mx-auto mb-6 rounded-full ring-2 ring-accent/40 bg-card object-cover shadow-md" />
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground mb-4">The Baltimore Mutualist Club</p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-foreground max-w-4xl mx-auto">
              A community of Baltimoreans who actually <em className="text-accent">show up</em> for each other.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
              Not a charity. Not an app. A circle of neighbors who pool a bit each month, eat together,
              and quietly carry each other through.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Link to="/signup">
                <Button size="lg" className="rounded-full text-base px-8 gap-2">
                  Join the Club <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 gap-2 border-primary/30">
                  <MessageCircle className="h-4 w-4" /> Chat with a member
                </Button>
              </Link>
            </div>

            <p className="font-serif italic text-sm text-muted-foreground mt-10">
              susu · tanda · hui · kye · tanomoshi — we're carrying it forward.
            </p>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["50+", "members"],
            ["$23k+", "moved between neighbors"],
            ["12", "monthly gatherings"],
            ["100%", "of payments completed"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-serif text-3xl md:text-4xl text-accent">{n}</p>
              <p className="text-xs uppercase tracking-wider opacity-80 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The new story */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">The story</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            There are people who care enough about each other that they're willing to join this.
          </h2>
          <div className="mt-8 space-y-5 text-lg text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">100% of peer-to-peer payments actually get made.</strong>
              {" "}Not because of contracts. Because we know each other's names.
            </p>
            <p>
              We have fun, and we show up for each other. There are gatherings every month —
              potlucks, skill shares, Sunday coffee, kids running around.
            </p>
            <p className="font-serif italic text-foreground">
              "All flourishing is mutual." — Robin Wall Kimmerer
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">How it works</p>
            <h2 className="font-serif text-4xl">No middleman. Just neighbors.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "You share what you have", body: "Each month members contribute 7% of post-tax income — directly, person to person." },
              { title: "We do the math, gently", body: "On the 1st, the steward calculates who sends to whom. No pool, no overhead, no gatekeepers." },
              { title: "You meet your neighbor", body: "You Venmo or Zelle a real person — and often, you end up sharing a meal with them." },
            ].map((s, i) => (
              <Card key={s.title} className="hover-pop">
                <CardContent className="p-6">
                  <p className="font-serif text-accent text-3xl">0{i + 1}</p>
                  <h3 className="font-serif text-xl mt-2">{s.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-20">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">See the math</p>
            <h2 className="font-serif text-4xl">What would your month look like?</h2>
          </div>
          <Card>
            <CardContent className="p-6 md:p-8 space-y-5">
              <div>
                <label className="text-sm text-muted-foreground">Your post-tax monthly income</label>
                <Input
                  type="number"
                  value={myIncome}
                  onChange={(e) => setMyIncome(e.target.value)}
                  placeholder="e.g. 3500"
                  className="mt-1 text-lg"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Estimated club average</label>
                <Input
                  type="number"
                  value={groupAvg}
                  onChange={(e) => setGroupAvg(e.target.value)}
                  className="mt-1 text-lg"
                />
              </div>
              {hasResult && (
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">You'd contribute</span><span className="font-serif text-lg">${myContribution.toFixed(0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Equal share</span><span className="font-serif text-lg">${equalShare.toFixed(0)}</span></div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-serif text-lg">{net >= 0 ? "You'd receive" : "You'd send"}</span>
                    <span className={`font-serif text-3xl ${net >= 0 ? "text-success" : "text-accent"}`}>
                      ${Math.abs(net).toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <Heart className="h-8 w-8 text-accent mx-auto mb-4 fill-accent" />
          <h2 className="font-serif text-4xl md:text-5xl">Come carry something with us.</h2>
          <p className="text-lg opacity-80 mt-4">
            New members are welcomed by an existing member. Apply, and someone will reach out within a few days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/signup"><Button size="lg" variant="secondary" className="rounded-full px-8">Join the Club</Button></Link>
            <Link to="/about"><Button size="lg" variant="outline" className="rounded-full px-8 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">About us</Button></Link>
          </div>
          <p className="font-serif italic text-sm opacity-70 mt-8">
            "The currency is friendship." — what a member said at our last potluck.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
