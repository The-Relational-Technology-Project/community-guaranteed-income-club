import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeftRight, Heart, DollarSign, Sparkles, ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4">
        {/* Background shapes */}
        <div className="absolute inset-0 pattern-dots pointer-events-none" />
        <div className="absolute top-10 -left-20 w-72 h-72 bg-primary/10 animate-blob-morph pointer-events-none" />
        <div className="absolute bottom-10 -right-16 w-60 h-60 bg-accent/15 fun-blob-2 animate-float pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-pop/20 rounded-full animate-float-delayed pointer-events-none" />

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-medium px-4 py-2 rounded-full text-sm mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Started with 20 friends. Now 50+. Goal: 150.
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 font-display leading-[0.95]">
            We take care of{" "}
            <span className="text-gradient-pop">each other.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-body">
            We each set aside 7% of our income, pool it together, and split it equally. 
            Those who earn more share with those who earn less.{" "}
            <span className="text-foreground font-semibold">No strings attached. Just neighbors being neighbors.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-10 py-6 rounded-full font-display font-semibold shadow-lg hover-wiggle gap-2">
                Join the Movement
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 rounded-full font-display font-semibold border-2">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bold statement band */}
      <section className="bg-primary text-primary-foreground py-6 -rotate-1 scale-[1.02]">
        <div className="flex gap-8 items-center justify-center text-lg md:text-xl font-display font-bold tracking-wide whitespace-nowrap overflow-hidden">
          <span>✦ COMMUNITY</span>
          <span>✦ SOLIDARITY</span>
          <span>✦ REDISTRIBUTION</span>
          <span>✦ LOVE</span>
          <span>✦ BALTIMORE</span>
          <span className="hidden md:inline">✦ NEIGHBORS</span>
          <span className="hidden lg:inline">✦ 7%</span>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-pop/10 fun-blob-3 pointer-events-none" />
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-3">
              Dead simple.
            </h2>
            <p className="text-muted-foreground text-lg">Four steps. That's it. No catch.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              {
                icon: Users,
                title: "Sign up",
                desc: "Create an account, tell us about yourself. Get verified by someone already in the group.",
                color: "bg-primary",
                rotate: "rotate-fun",
              },
              {
                icon: DollarSign,
                title: "7% goes in",
                desc: "Every month, 7% of your post-tax income goes into the community pot. Simple as that.",
                color: "bg-accent",
                rotate: "rotate-fun-2",
              },
              {
                icon: ArrowLeftRight,
                title: "Split equally",
                desc: "The whole pot gets divided equally. Earn above average? You send. Below? You receive.",
                color: "bg-fresh",
                rotate: "rotate-fun-3",
              },
              {
                icon: Heart,
                title: "Meet people",
                desc: "You'll know exactly who you're helping (and who's helping you). Say hi. Grab coffee.",
                color: "bg-warm",
                rotate: "rotate-fun",
              },
            ].map((step, i) => (
              <Card key={i} className={`${step.rotate} hover-pop border-2 border-border/50`}>
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 font-display">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Real Talk / Example */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-secondary rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-pop/20 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/10 fun-blob pointer-events-none" />
            
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-8 relative z-10">
              OK but what does this <span className="text-accent">actually</span> look like?
            </h2>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-card rounded-2xl p-6 border-2 border-border/30 hover-pop">
                <p className="text-sm text-muted-foreground mb-2 font-medium">THE GROUP AVERAGE</p>
                <p className="text-4xl font-bold font-display text-primary">$2,800</p>
                <p className="text-sm text-muted-foreground mt-1">monthly income</p>
                <p className="text-2xl font-bold font-display text-accent mt-3">$196</p>
                <p className="text-sm text-muted-foreground">equal share per person</p>
              </div>

              <div className="bg-card rounded-2xl p-6 border-2 border-accent/30 hover-pop">
                <p className="text-sm text-muted-foreground mb-2 font-medium">SOMEONE EARNING $4,000</p>
                <p className="text-sm text-muted-foreground mt-2">Contributes <span className="font-bold text-foreground">$280</span> (7%)</p>
                <p className="text-sm text-muted-foreground">Gets back <span className="font-bold text-foreground">$196</span></p>
                <div className="mt-3 bg-accent/10 rounded-xl px-4 py-3">
                  <p className="text-accent font-bold font-display text-lg">Sends $84</p>
                  <p className="text-xs text-muted-foreground">They probably won't even notice 🤷</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border-2 border-fresh/30 hover-pop">
                <p className="text-sm text-muted-foreground mb-2 font-medium">SOMEONE EARNING $1,500</p>
                <p className="text-sm text-muted-foreground mt-2">Contributes <span className="font-bold text-foreground">$105</span> (7%)</p>
                <p className="text-sm text-muted-foreground">Gets back <span className="font-bold text-foreground">$196</span></p>
                <div className="mt-3 bg-fresh/10 rounded-xl px-4 py-3">
                  <p className="text-fresh font-bold font-display text-lg">Receives $91</p>
                  <p className="text-xs text-muted-foreground">That's groceries. A bill. A weight off. 💛</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Big bold CTA */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 pattern-dots opacity-10 pointer-events-none" />
        <div className="absolute top-8 left-8 w-24 h-24 bg-accent/30 fun-blob animate-float pointer-events-none" />
        <div className="absolute bottom-8 right-12 w-32 h-32 bg-pop/20 fun-blob-2 animate-float-delayed pointer-events-none" />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold font-display text-primary-foreground mb-4 leading-tight">
            Not to brag or anything, but we're kind of changing how communities work.
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            We started in April 2025 with 20 people and zero issues. Now we're growing to 150.
            Every person who joins makes the whole thing stronger.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl px-12 py-7 rounded-full font-display font-bold shadow-2xl hover-wiggle">
              Yeah, I'm in ✌️
            </Button>
          </Link>
        </div>
      </section>

      {/* Fun facts ticker */}
      <section className="bg-pop text-pop-foreground py-4 rotate-1 scale-[1.02] -mt-2">
        <div className="flex gap-8 items-center justify-center text-base md:text-lg font-display font-bold tracking-wide whitespace-nowrap overflow-hidden">
          <span>🏡 BALTIMORE</span>
          <span>💛 50+ MEMBERS</span>
          <span>📊 $0 OVERHEAD</span>
          <span>🤝 PEER TO PEER</span>
          <span>✨ SINCE 2025</span>
        </div>
      </section>
    </div>
  );
};

export default Landing;
