import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: "Error signing in", description: error.message, variant: "destructive" });
    } else {
      navigate("/home");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        shouldCreateUser: false,
      },
    });
    setMagicLoading(false);
    if (error) {
      toast({ title: "Couldn't send link", description: error.message, variant: "destructive" });
    } else {
      setMagicSent(true);
      toast({ title: "Check your email", description: "We sent you a sign-in link." });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Welcome back</CardTitle>
          <CardDescription>Sign in to the Club</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="magic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="magic">Magic link</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>

            <TabsContent value="magic">
              {magicSent ? (
                <div className="text-center space-y-2 py-4">
                  <p className="text-base">📬 Link sent to <strong>{magicEmail}</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Click the link in your inbox to sign in. It's good for one hour.
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => { setMagicSent(false); setMagicEmail(""); }}>
                    Use a different email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="you@example.com"
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      No password required — we'll email you a one-time sign-in link.
                    </p>
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={magicLoading}>
                    {magicLoading ? "Sending..." : "Send me a sign-in link"}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="password">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Join the program
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
