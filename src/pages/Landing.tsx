import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeftRight, Heart, DollarSign, ArrowRight, HandHeart, Handshake, CircleDollarSign } from "lucide-react";

const Landing = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero — Full color background */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 pattern-dots opacity-[0.06] pointer-events-none" />
        
        {/* Decorative circles — communal, connected */}
        <div className="absolute top-12 right-[10%] w-48 h-48 rounded-full border-4 border-primary-foreground/10 pointer-events-none" />
        <div className="absolute top-20 right-[14%] w-32 h-32 rounded-full border-4 border-primary-foreground/10 pointer-events-none" />
        <div className="absolute bottom-12 left-[5%] w-36 h-36 rounded-full bg-accent/20 pointer-events-none" />
        <div className="absolute bottom-24 left-[8%] w-20 h-20 rounded-full bg-pop/20 pointer-events-none" />

        <div className="container mx-auto max-w-5xl px-4 pt-20 pb-24 md:pt-28 md:pb-32 relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm font-medium px-5 py-2.5 rounded-full text-sm mb-8">
            <Heart className="h-4 w-4 fill-current" />
            50+ neighbors. $0 overhead. 100% community.
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-6 font-display leading-[0.95] max-w-4xl">
            We take care
            <br />
            of each other.
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl leading-relaxed">
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
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 rounded-full font-display font-semibold border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Color band */}
      <div className="flex h-3">
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-pop" />
        <div className="flex-1 bg-fresh" />
        <div className="flex-1 bg-warm" />
        <div className="flex-1 bg-primary" />
      </div>

      {/* How It Works — Colorful cards */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-3">
              Four steps. No catch.
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Dead simple, radically generous, genuinely human.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: Users,
                title: "Sign up & get verified",
                desc: "Create your account and share a bit about yourself. Someone already in the group vouches for you. Welcome to the family.",
                bg: "bg-primary",
                accent: "text-primary",
              },
              {
                icon: CircleDollarSign,
                title: "7% goes into the pot",
                desc: "Every month, 7% of your post-tax income goes into the community pool. Same percentage for everyone. Fair and square.",
                bg: "bg-accent",
                accent: "text-accent",
              },
              {
                icon: ArrowLeftRight,
                title: "Split it equally",
                desc: "The whole pot gets divided by the number of people. Earn above average? You send a little. Below? You receive a little.",
                bg: "bg-fresh",
                accent: "text-fresh",
              },
              {
                icon: Handshake,
                title: "Actually meet each other",
                desc: "You'll know who you're paired with. Say hi. Grab coffee. This isn't just money — it's relationships.",
                bg: "bg-warm",
                accent: "text-warm",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="group bg-card rounded-2xl border-2 border-border/50 p-7 hover-pop flex gap-5 items-start"
              >
                <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className={`font-bold text-xl mb-2 font-display ${step.accent}`}>{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Math — vivid colored panels */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4 text-center">
            OK, what does this <span className="text-accent">actually</span> look like?
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Real math, real impact, really not that complicated.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Group average */}
            <div className="bg-primary text-primary-foreground rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-primary-foreground/10" />
              <div className="absolute bottom-4 right-8 w-10 h-10 rounded-full bg-primary-foreground/10" />
              <p className="text-sm font-medium opacity-80 mb-1">GROUP AVERAGE</p>
              <p className="text-5xl font-bold font-display">$2,800</p>
              <p className="text-sm opacity-70 mt-1">monthly income</p>
              <div className="mt-6 pt-4 border-t border-primary-foreground/20">
                <p className="text-3xl font-bold font-display">$196</p>
                <p className="text-sm opacity-70">equal share each</p>
              </div>
            </div>

            {/* Sender */}
            <div className="bg-accent text-accent-foreground rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-accent-foreground/10" />
              <p className="text-sm font-medium opacity-80 mb-1">EARNING $4,000/MO</p>
              <p className="text-sm opacity-80 mt-3">Puts in <span className="font-bold text-lg">$280</span> (7%)</p>
              <p className="text-sm opacity-80">Gets back <span className="font-bold text-lg">$196</span></p>
              <div className="mt-6 bg-accent-foreground/15 rounded-2xl px-5 py-4">
                <p className="font-bold font-display text-2xl">Sends $84</p>
                <p className="text-sm opacity-80 mt-1">Won't even notice it's gone 🤷</p>
              </div>
            </div>

            {/* Receiver */}
            <div className="bg-fresh text-fresh-foreground rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-fresh-foreground/10" />
              <p className="text-sm font-medium opacity-80 mb-1">EARNING $1,500/MO</p>
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

      {/* Testimonial / Values band */}
      <section className="bg-pop text-pop-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <HandHeart className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <blockquote className="text-2xl md:text-4xl font-bold font-display leading-snug mb-6">
            "It's also a reminder that other people care and you're not on your own."
          </blockquote>
          <p className="text-lg opacity-80">
            — The whole point of this thing, honestly
          </p>
        </div>
      </section>

      {/* Big CTA */}
      <section className="relative py-24 px-4 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-[0.06] pointer-events-none" />
        
        {/* Connected circles motif */}
        <div className="absolute top-1/2 left-[5%] -translate-y-1/2 flex gap-[-8px] pointer-events-none opacity-20">
          <div className="w-24 h-24 rounded-full border-4 border-primary-foreground" />
          <div className="w-24 h-24 rounded-full border-4 border-primary-foreground -ml-6" />
          <div className="w-24 h-24 rounded-full border-4 border-primary-foreground -ml-6" />
        </div>
        <div className="absolute top-8 right-[8%] w-20 h-20 rounded-full bg-accent/30 pointer-events-none" />
        <div className="absolute bottom-8 right-[12%] w-12 h-12 rounded-full bg-pop/30 pointer-events-none" />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
            Not to brag,
            <br />
            but we're kind of
            <br />
            <span className="text-accent">changing how</span>
            <br />
            <span className="text-accent">communities work.</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            Started April 2025. 20 people. Zero issues. Now 50+ and growing to 150.
            Every person who joins makes the whole thing stronger.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl px-14 py-7 rounded-full font-display font-bold shadow-2xl hover-wiggle">
              Yeah, I'm in ✌️
            </Button>
          </Link>
        </div>
      </section>

      {/* Color band footer accent */}
      <div className="flex h-3">
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
