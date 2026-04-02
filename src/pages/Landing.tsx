import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeftRight, Heart, DollarSign, ArrowRight, HandHeart, Handshake, CircleDollarSign } from "lucide-react";

const Landing = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero — Full width, content spread across */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 pattern-dots opacity-[0.06] pointer-events-none" />

        {/* Decorative circles — spread across both sides */}
        <div className="absolute top-16 right-[8%] w-44 h-44 rounded-full border-[3px] border-primary-foreground/10 pointer-events-none" />
        <div className="absolute top-24 right-[12%] w-28 h-28 rounded-full border-[3px] border-primary-foreground/10 pointer-events-none" />
        <div className="absolute bottom-20 right-[15%] w-64 h-64 rounded-full bg-accent/15 pointer-events-none" />
        <div className="absolute top-32 left-[60%] w-16 h-16 rounded-full bg-pop/20 pointer-events-none" />

        <div className="container mx-auto max-w-6xl px-4 pt-20 pb-28 md:pt-28 md:pb-36 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm font-medium px-5 py-2.5 rounded-full text-sm mb-8">
                <Heart className="h-4 w-4 fill-current" />
                50+ neighbors · $0 overhead · 100% community
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 font-display leading-[0.95]">
                We take care
                <br />
                of each other.
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 leading-relaxed max-w-lg">
                7% of your income goes into a shared pot. The pot gets split equally.
                That's it. Just neighbors being neighbors in Baltimore.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-6 rounded-full font-display font-bold shadow-xl hover-wiggle gap-2">
                    Join the Movement
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" className="text-lg px-10 py-6 rounded-full font-display font-semibold border-2 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side — big stat/impact panel */}
            <div className="hidden md:flex flex-col gap-4 items-end">
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 max-w-sm w-full">
                <p className="text-sm font-medium opacity-70 mb-1">REDISTRIBUTED SO FAR</p>
                <p className="text-5xl font-bold font-display">$12,400+</p>
                <p className="text-sm opacity-70 mt-1">across 50+ Baltimoreans</p>
              </div>
              <div className="flex gap-4 w-full max-w-sm">
                <div className="bg-accent/20 backdrop-blur-sm rounded-2xl p-5 flex-1">
                  <p className="text-3xl font-bold font-display">7%</p>
                  <p className="text-xs opacity-70">of your income</p>
                </div>
                <div className="bg-pop/20 backdrop-blur-sm rounded-2xl p-5 flex-1 text-center">
                  <p className="text-lg font-bold font-display leading-tight">Knowing your neighbor Matt</p>
                  <p className="text-xs opacity-70 mt-1">priceless (also free)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curved transition out of hero */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 80V30C240 60 480 75 720 65C960 55 1200 30 1440 20V80H0Z" fill="hsl(var(--secondary))" fillOpacity="0.5" />
            <path d="M0 80V50C360 70 720 80 1080 65C1260 57 1350 45 1440 40V80H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* How It Works — Flowing layout */}
      <section className="py-16 md:py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-3">
              Four steps. No catch.
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Dead simple, radically generous, genuinely human.
            </p>
          </div>

          {/* Alternating layout for flow */}
          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
            {[
              {
                icon: Users,
                title: "Sign up & get verified",
                desc: "Create your account and share a bit about yourself. Someone already in the group vouches for you. Welcome to the family.",
                bg: "bg-primary",
              },
              {
                icon: CircleDollarSign,
                title: "7% goes into the pot",
                desc: "Every month, 7% of your post-tax income goes into the community pool. Same percentage for everyone. Fair and square.",
                bg: "bg-accent",
              },
              {
                icon: ArrowLeftRight,
                title: "Split it equally",
                desc: "The whole pot gets divided by the number of people. Earn above average? You send a little. Below? You receive a little.",
                bg: "bg-fresh",
              },
              {
                icon: Handshake,
                title: "Actually meet each other",
                desc: "You'll know who you're paired with. Say hi. Grab coffee. This isn't just money — it's relationships.",
                bg: "bg-warm",
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`group bg-card rounded-2xl border-2 border-border/50 p-7 hover-pop flex gap-5 items-start ${i === 1 ? "md:mt-8" : i === 3 ? "md:mt-8" : ""}`}
              >
                <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2 font-display">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curved transition into math */}
      <div className="relative">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block -mb-1">
          <path d="M0 0V40C360 10 720 0 1080 15C1260 23 1350 35 1440 45V0H0Z" fill="hsl(var(--background))" />
          <path d="M0 60C240 30 480 15 720 25C960 35 1200 50 1440 30V60H0Z" fill="hsl(var(--secondary))" fillOpacity="0.5" />
        </svg>
      </div>

      {/* The Math — vivid colored panels, full width feel */}
      <section className="py-16 md:py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="md:flex md:items-end md:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold font-display mb-2">
                OK, what does this <span className="text-accent">actually</span> look like?
              </h2>
              <p className="text-muted-foreground text-lg">
                Real math. Real impact. Really not complicated.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Group average */}
            <div className="bg-primary text-primary-foreground rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-primary-foreground/8 pointer-events-none" />
              <div className="absolute bottom-6 right-10 w-12 h-12 rounded-full bg-primary-foreground/8 pointer-events-none" />
              <p className="text-sm font-medium opacity-80 mb-1">GROUP AVERAGE</p>
              <p className="text-5xl font-bold font-display">$2,800<span className="text-2xl opacity-70">/mo</span></p>
              <p className="text-sm opacity-70 mt-1">≈ $33,600/year</p>
              <div className="mt-6 pt-4 border-t border-primary-foreground/20">
                <p className="text-3xl font-bold font-display">$196</p>
                <p className="text-sm opacity-70">equal share each month</p>
              </div>
            </div>

            {/* Sender */}
            <div className="bg-accent text-accent-foreground rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-accent-foreground/8 pointer-events-none" />
              <p className="text-sm font-medium opacity-80 mb-1">EARNING $4,000/MO</p>
              <p className="text-xs opacity-60">($48,000/year)</p>
              <p className="text-sm opacity-80 mt-3">Puts in <span className="font-bold text-lg">$280</span> (7%)</p>
              <p className="text-sm opacity-80">Gets back <span className="font-bold text-lg">$196</span></p>
              <div className="mt-6 bg-accent-foreground/15 rounded-2xl px-5 py-4">
                <p className="font-bold font-display text-2xl">Sends $84</p>
                <p className="text-sm opacity-80 mt-1">Won't even notice it's gone 🤷</p>
              </div>
            </div>

            {/* Receiver */}
            <div className="bg-fresh text-fresh-foreground rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-fresh-foreground/8 pointer-events-none" />
              <p className="text-sm font-medium opacity-80 mb-1">EARNING $1,500/MO</p>
              <p className="text-xs opacity-60">($18,000/year)</p>
              <p className="text-sm opacity-80 mt-3">Puts in <span className="font-bold text-lg">$105</span> (7%)</p>
              <p className="text-sm opacity-80">Gets back <span className="font-bold text-lg">$196</span></p>
              <div className="mt-6 bg-fresh-foreground/15 rounded-2xl px-5 py-4">
                <p className="font-bold font-display text-2xl">Gets $91</p>
                <p className="text-sm opacity-80 mt-1">Groceries. A bill. A deep breath. 💛</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote / Values — warm flowing section */}
      <div className="relative">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block -mb-1">
          <path d="M0 60V20C360 50 720 60 1080 45C1260 37 1350 25 1440 15V60H0Z" fill="hsl(var(--pop))" />
        </svg>
      </div>
      <section className="bg-pop text-pop-foreground py-16 px-4">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-10">
          <div className="w-20 h-20 md:w-28 md:h-28 bg-pop-foreground/10 rounded-full flex items-center justify-center flex-shrink-0">
            <HandHeart className="h-10 w-10 md:h-14 md:w-14 opacity-80" />
          </div>
          <div>
            <blockquote className="text-2xl md:text-3xl font-bold font-display leading-snug mb-4">
              "We make a living by what we get. We make a life by what we give."
            </blockquote>
            <p className="text-lg opacity-80">
              — Winston Churchill
            </p>
          </div>
        </div>
      </section>

      {/* Curved transition to CTA */}
      <div className="relative">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block -mb-1">
          <path d="M0 0C240 30 480 50 720 40C960 30 1200 10 1440 25V0H0Z" fill="hsl(var(--pop))" />
          <path d="M0 60V30C360 55 720 60 1080 50C1260 45 1350 38 1440 35V60H0Z" fill="hsl(var(--primary))" />
        </svg>
      </div>

      {/* CTA */}
      <section className="relative py-24 px-4 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-[0.06] pointer-events-none" />
        <div className="absolute top-10 right-[10%] w-20 h-20 rounded-full bg-accent/25 pointer-events-none" />
        <div className="absolute bottom-12 left-[8%] w-14 h-14 rounded-full bg-pop/25 pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              Not to brag, but we're kind of{" "}
              <span className="text-accent">changing how communities work.</span>
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Started April 2025. 20 people. Zero issues. Now 50+ and growing to 150.
              Every person who joins makes the whole thing stronger.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl px-14 py-7 rounded-full font-display font-bold shadow-2xl hover-wiggle">
                Yeah, I'm in ✌️
              </Button>
            </Link>
          </div>

          {/* Mini stats */}
          <div className="flex flex-row md:flex-col gap-4">
            <div className="bg-primary-foreground/10 rounded-2xl p-5 text-center min-w-[120px]">
              <p className="text-3xl font-bold font-display">20</p>
              <p className="text-xs opacity-70">pilot members</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-2xl p-5 text-center min-w-[120px]">
              <p className="text-3xl font-bold font-display">50+</p>
              <p className="text-xs opacity-70">and growing</p>
            </div>
            <div className="bg-accent/25 rounded-2xl p-5 text-center min-w-[120px]">
              <p className="text-3xl font-bold font-display">150</p>
              <p className="text-xs opacity-70">goal this year</p>
            </div>
          </div>
        </div>
      </section>

      {/* Color band */}
      <div className="flex h-2">
        <div className="flex-1 bg-primary" />
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-pop" />
        <div className="flex-1 bg-fresh" />
        <div className="flex-1 bg-warm" />
      </div>
    </div>
  );
};

export default Landing;
