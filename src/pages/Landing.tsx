import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeftRight, Heart, DollarSign } from "lucide-react";

const Landing = () => {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Community <span className="text-primary">Guaranteed Income</span> for Baltimore
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We each set aside 7% of our income, pool it together, and redistribute it equally.
            Those who earn more share with those who earn less — no strings attached.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Join the Program
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-secondary/50 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "Join",
                desc: "Sign up and share your post-tax monthly income. You're verified by someone already in the group.",
              },
              {
                icon: DollarSign,
                title: "Contribute 7%",
                desc: "Each month, 7% of everyone's income goes into a shared pool of human kindness.",
              },
              {
                icon: ArrowLeftRight,
                title: "Redistribute",
                desc: "The pool is divided equally. If your share is more than your contribution, you receive. If less, you send.",
              },
              {
                icon: Heart,
                title: "Connect",
                desc: "Meet the people you're supporting and who support you. Build real relationships in your community.",
              },
            ].map((step, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Example */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">What Does This Look Like?</h2>
          <Card>
            <CardContent className="pt-6 space-y-4 text-muted-foreground">
              <p>
                If the average monthly income of the group is <strong className="text-foreground">$2,800</strong>, 
                the equal share works out to about <strong className="text-foreground">$196/month</strong>.
              </p>
              <p>
                Someone earning $4,000/month contributes $280 (7%) and receives $196 back — 
                a net contribution of <strong className="text-foreground">$84</strong>. They probably barely notice.
              </p>
              <p>
                Someone earning $1,500/month contributes $105 (7%) and receives $196 back — 
                a net gain of <strong className="text-foreground">$91</strong>. That's groceries, a utility bill, or gas to get to work.
              </p>
              <p className="text-foreground font-medium">
                It's also a reminder that other people care and you're not on your own.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-lg opacity-90 mb-8">
            We started with 20 people in April 2025 and have grown to 50. Our goal is 150 by the end of the year.
            Every new member strengthens the community.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
