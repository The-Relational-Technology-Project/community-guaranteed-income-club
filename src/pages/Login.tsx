import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const demoAsMaya = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: "maya@test.com", password: "test1234" });
    setLoading(false);
    if (error) {
      toast({ title: "Demo login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/home");
    }
  };

  const demoAsSteward = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: "admin@test.com", password: "test1234" });
    setLoading(false);
    if (error) {
      toast({ title: "Steward login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
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
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-accent/40"
              onClick={demoAsMaya}
              disabled={loading}
            >
              ✨ Demo as Maya
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-primary/30"
              onClick={demoAsSteward}
              disabled={loading}
            >
              Shield Demo as Steward
            </Button>
          </div>
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
