import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart, Calendar, Check } from "lucide-react";
import { ClubMark } from "@/components/Wordmark";
import { CHAPTER, ORG } from "@/lib/chapter";

const Wave = ({ className = "", flip = false, fill = "hsl(var(--background))" }: { className?: string; flip?: boolean; fill?: string }) => (
  <svg
    viewBox="0 0 1440 80"
    preserveAspectRatio="none"
    aria-hidden="true"
    className={`w-full h-12 md:h-20 block ${flip ? "rotate-180" : ""} ${className}`}
  >
    <path
      d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
      fill={fill}
    />
  </svg>
);

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
      {/* Hero — bold yellow block */}
      <section className="relative bg-pop overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-accent/80" aria-hidden />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/90" aria-hidden />
        <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-fresh/70 hidden md:block" aria-hidden />

        <div className="container mx-auto max-w-5xl px-4 pt-16 md:pt-24 pb-20 relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ClubMark size={44} />
            <p className="font-display font-bold text-sm md:text-base uppercase tracking-[0.2em] text-pop-foreground">
              {CHAPTER.name} Chapter · First of many
            </p>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-pop-foreground max-w-4xl mx-auto text-center tracking-tight">
            <span className="relative inline-block">
              <span className="relative z-10 bg-primary text-primary-foreground px-3 py-1 inline-block rotate-[-1.5deg] rounded-md shadow-md">
                Mutual support
              </span>
              <span
                aria-hidden
                className="absolute -bottom-2 left-1 right-1 h-3 bg-accent/70 rounded-full -z-0"
              />
            </span>{" "}
            through income sharing.
          </h1>

          <p className="text-lg md:text-2xl text-pop-foreground/85 mt-8 max-w-2xl mx-auto leading-relaxed text-center font-medium">
            Not a charity. Not an app. A circle of neighbors who pool a bit each month,
            eat together, and quietly carry each other through.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link to="/signup">
              <Button size="lg" className="rounded-full text-base px-8 gap-2 h-14 font-bold shadow-lg">
                Join the Club <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="rounded-full text-base px-8 gap-2 h-14 font-bold bg-card border-2 border-foreground/10 hover:bg-card/80">
                How it works
              </Button>
            </Link>
          </div>

          <p className="font-serif italic text-sm text-pop-foreground/70 mt-10 text-center">
            susu · tanda · hui · kye · tanomoshi — we're carrying it forward.
          </p>
        </div>
        <Wave fill="hsl(var(--background))" />
      </section>

      {/* Stats strip */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["50+", "members"],
            ["$23k+", "moved between neighbors"],
            ["12", "monthly gatherings"],
            ["100%", "of payments completed"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display font-bold text-4xl md:text-5xl text-pop">{n}</p>
              <p className="text-xs uppercase tracking-wider opacity-90 mt-2 font-semibold">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The new story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4 font-bold">The story</p>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] tracking-tight">
            People who care enough about each other to actually <span className="text-accent">show up</span>.
          </h2>
          <div className="mt-8 space-y-5 text-lg md:text-xl text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">100% of peer-to-peer payments actually get made.</strong>
              {" "}Not because of contracts. Because we know each other's names.
            </p>
            <p>
              We have fun and we show up. There are gatherings every month —
              potlucks, skill shares, Sunday coffee, kids running around.
            </p>
            <p className="font-serif italic text-foreground text-2xl pt-4">
              "All flourishing is mutual." — Robin Wall Kimmerer
            </p>
          </div>
        </div>
      </section>

      {/* How it works — bold colored cards */}
      <section className="bg-secondary/60 py-20 relative">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3 font-bold">How it works</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">No middleman. Just neighbors.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "You share what you have", body: "Each month members contribute 7% of post-tax income — directly, person to person.", bg: "bg-primary text-primary-foreground", num: "text-pop" },
              { title: "We do the math, gently", body: "On the 1st, the steward calculates who sends to whom. No pool, no overhead, no gatekeepers.", bg: "bg-accent text-accent-foreground", num: "text-pop" },
              { title: "You meet your neighbor", body: "You Venmo or Zelle a real person — and often, you end up sharing a meal with them.", bg: "bg-fresh text-fresh-foreground", num: "text-pop" },
            ].map((s, i) => (
              <Card key={s.title} className={`hover-pop border-0 ${s.bg} rounded-2xl`}>
                <CardContent className="p-6">
                  <p className={`font-display font-bold text-5xl ${s.num}`}>0{i + 1}</p>
                  <h3 className="font-display font-bold text-2xl mt-3 leading-tight">{s.title}</h3>
                  <p className="opacity-90 mt-2 text-sm md:text-base leading-relaxed">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-20 bg-background">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3 font-bold">See the math</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">What would your month look like?</h2>
          </div>
          <Card className="border-2 border-foreground/10 rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div>
                <label className="text-sm font-semibold">Your post-tax monthly income</label>
                <Input
                  type="number"
                  value={myIncome}
                  onChange={(e) => setMyIncome(e.target.value)}
                  placeholder="e.g. 3500"
                  className="mt-1 text-lg"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Estimated club average</label>
                <Input
                  type="number"
                  value={groupAvg}
                  onChange={(e) => setGroupAvg(e.target.value)}
                  className="mt-1 text-lg"
                />
              </div>
              {hasResult && (
                <div className="pt-4 border-t-2 border-dashed border-border space-y-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">You'd contribute</span><span className="font-serif text-lg">${myContribution.toFixed(0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Equal share</span><span className="font-serif text-lg">${equalShare.toFixed(0)}</span></div>
                  <div className={`flex justify-between items-center pt-4 mt-2 rounded-xl px-4 py-4 ${net >= 0 ? "bg-fresh text-fresh-foreground" : "bg-accent text-accent-foreground"}`}>
                    <span className="font-display font-bold text-lg">{net >= 0 ? "You'd receive" : "You'd send"}</span>
                    <span className="font-display font-bold text-4xl">
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
      <section className="bg-accent text-accent-foreground py-20 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-pop/40" aria-hidden />
        <div className="absolute -bottom-16 -right-12 h-56 w-56 rounded-full bg-primary/40" aria-hidden />
        <div className="container mx-auto max-w-2xl px-4 text-center relative">
          <Heart className="h-10 w-10 text-pop mx-auto mb-4 fill-pop" />
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight tracking-tight">Come carry something with us.</h2>
          <p className="text-lg md:text-xl opacity-90 mt-4 font-medium">
            New members are welcomed by an existing member. Apply, and someone will reach out within a few days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/signup"><Button size="lg" className="rounded-full px-8 h-14 font-bold bg-card text-foreground hover:bg-card/90">Join the Club</Button></Link>
            <Link to="/about"><Button size="lg" variant="outline" className="rounded-full px-8 h-14 font-bold border-2 border-accent-foreground/40 bg-transparent text-accent-foreground hover:bg-accent-foreground/10">About us</Button></Link>
          </div>
          <p className="font-serif italic text-sm opacity-80 mt-8">
            "The currency is friendship." — what a member said at our last potluck.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
