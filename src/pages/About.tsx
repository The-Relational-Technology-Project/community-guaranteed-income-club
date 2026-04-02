import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About the Program</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We started in April 2025, inspired by <strong className="text-foreground">Co Mingle</strong> and 
              the idea of Universal Basic Income. After many of our peers lost their jobs in global health 
              or faced uncertainty as federal workers, we wanted to do something to support them.
            </p>
            <p>
              We ran a pilot of 20 people without any issues, surveyed participants, and since then 
              have been slowly growing to ~50 people. Our goal is to reach 150 members by the end of the year.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Every member contributes <strong className="text-foreground">7% of their post-tax monthly income</strong> into 
              a shared pool. That pool is then divided equally among all participants.
            </p>
            <p>
              If your equal share is more than your contribution, you receive money. If it's less, you send money. 
              The math is simple: those who can afford it share with those who need it most.
            </p>
            <p>
              A ton of research has proven that the best way to fight poverty is with <strong className="text-foreground">direct cash, 
              no strings attached</strong>. That extra $100-200/month can mean a trip to the grocery store, 
              a tank of gas, or a visit to the dentist.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>April 2025 Pilot Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li>20 participants completed the pilot successfully</li>
              <li>All transactions were completed on time</li>
              <li>Survey results showed high satisfaction and willingness to continue</li>
              <li>Participants reported feeling more connected to their community</li>
              <li>The program has since grown to approximately 50 active members</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-foreground">Distribute money</strong> within a community to support neighbors and value people who are not compensated as much</li>
              <li><strong className="text-foreground">Reduce friction</strong> in the actual sending of money</li>
              <li><strong className="text-foreground">Increase friction</strong> where it means interacting & getting to know other people</li>
              <li><strong className="text-foreground">Build community</strong> through new relationships</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What This Is Not</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>This is not a group for emergency mutual aid. It's a consistent, ongoing program 
            designed to reduce income inequality within our community through regular redistribution.</p>
          </CardContent>
        </Card>

        <div className="text-center pt-4">
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8">Join the Program</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
