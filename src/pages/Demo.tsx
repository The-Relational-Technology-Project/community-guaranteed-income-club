import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Demo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<"maya" | "steward" | null>(null);

  const signIn = async (email: string, dest: string, who: "maya" | "steward") => {
    setLoading(who);
    const { error } = await supabase.auth.signInWithPassword({ email, password: "test1234" });
    setLoading(null);
    if (error) {
      toast({ title: "Demo login failed", description: error.message, variant: "destructive" });
      return;
    }
    navigate(dest);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Take a live tour</CardTitle>
          <CardDescription>
            Step into the Club as one of two pre-made accounts. The rest of the app
            is reserved for real members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full rounded-full h-12"
            onClick={() => signIn("maya@test.com", "/home", "maya")}
            disabled={loading !== null}
          >
            {loading === "maya" ? "Signing in…" : "✨ Enter as Maya (member)"}
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full h-12 border-primary/30"
            onClick={() => signIn("admin@test.com", "/admin", "steward")}
            disabled={loading !== null}
          >
            {loading === "steward" ? "Signing in…" : "🛡 Enter as the Steward (admin)"}
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2">
            These are demo accounts. Real members sign in by magic link from the
            Sign in page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Demo;