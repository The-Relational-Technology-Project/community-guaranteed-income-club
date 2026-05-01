import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [magicEmail, setMagicEmail] = useState("");
  const [magicName, setMagicName] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleMagicSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        shouldCreateUser: true,
        data: { name: magicName },
      },
    });
    setMagicLoading(false);
    if (error) {
      toast({ title: "Couldn't send link", description: error.message, variant: "destructive" });
    } else {
      // Notify Alex that someone new just signed up. Best-effort, never block UX.
      supabase.functions.invoke("send-email", {
        body: {
          kind: "new_signup_admin",
          newMember: { name: magicName, email: magicEmail },
        },
      }).catch(() => {});
      setMagicSent(true);
    }
  };

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    venmo_handle: "",
    zelle_info: "",
    zip_code: "",
    post_tax_monthly_income: "",
    student_loan_payment: "",
    profession: "",
    employment_status: "employed" as const,
    bio: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name: form.name },
      },
    });

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Update the auto-created profile with full details
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: form.name,
          phone: form.phone || null,
          venmo_handle: form.venmo_handle || null,
          zelle_info: form.zelle_info || null,
          zip_code: form.zip_code,
          post_tax_monthly_income: parseFloat(form.post_tax_monthly_income),
          student_loan_payment: form.student_loan_payment ? parseFloat(form.student_loan_payment) : 0,
          profession: form.profession || null,
          employment_status: form.employment_status,
          bio: form.bio || null,
        })
        .eq("id", data.user.id);

      if (profileError) {
        toast({ title: "Profile update failed", description: profileError.message, variant: "destructive" });
      }
    }

    setLoading(false);
    toast({
      title: "Welcome to the program!",
      description: "Please check your email to confirm your account.",
    });
    // Best-effort admin ping
    supabase.functions.invoke("send-email", {
      body: {
        kind: "new_signup_admin",
        newMember: {
          name: form.name,
          email: form.email,
          zip_code: form.zip_code,
          profession: form.profession,
        },
      },
    }).catch(() => {});
    navigate("/roster");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Join the Club</CardTitle>
          <CardDescription>
            {mode === "magic"
              ? "We'll email you a one-time sign-in link to get started"
              : step === 1 ? "Create your account" : "Tell us about yourself"}
          </CardDescription>
          {mode === "password" && (
            <div className="flex gap-2 justify-center mt-2">
              <div className={`h-1 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-1 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {mode === "magic" ? (
            magicSent ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-base">📬 Sign-in link sent to <strong>{magicEmail}</strong></p>
                <p className="text-sm text-muted-foreground">
                  Click the link in your inbox to finish setting up your profile. It's good for one hour.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMagicSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-name">Your name</Label>
                  <Input id="magic-name" value={magicName} onChange={(e) => setMagicName(e.target.value)} required />
                </div>
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
                    We'll email you a one-time link. After you sign in you'll finish your profile (income, ZIP, Venmo).
                  </p>
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={magicLoading}>
                  {magicLoading ? "Sending..." : "Send me a sign-in link"}
                </Button>
                <button
                  type="button"
                  className="block mx-auto text-xs text-muted-foreground hover:text-foreground underline"
                  onClick={() => setMode("password")}
                >
                  Prefer a password? Sign up the long way →
                </button>
              </form>
            )
          ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <Button type="button" className="w-full" onClick={() => {
                  if (!form.name || !form.email || !form.password) {
                    toast({ title: "Please fill required fields", variant: "destructive" });
                    return;
                  }
                  setStep(2);
                }}>
                  Next
                </Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venmo">Venmo Handle</Label>
                    <Input id="venmo" value={form.venmo_handle} onChange={(e) => update("venmo_handle", e.target.value)} placeholder="@username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zelle">Zelle Info</Label>
                    <Input id="zelle" value={form.zelle_info} onChange={(e) => update("zelle_info", e.target.value)} placeholder="email or phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input id="zip" value={form.zip_code} onChange={(e) => update("zip_code", e.target.value)} required maxLength={5} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income">Post-Tax Monthly Income *</Label>
                    <Input id="income" type="number" value={form.post_tax_monthly_income} onChange={(e) => update("post_tax_monthly_income", e.target.value)} required min={0} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loans">Student Loan Payment</Label>
                    <Input id="loans" type="number" value={form.student_loan_payment} onChange={(e) => update("student_loan_payment", e.target.value)} min={0} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession / Field</Label>
                  <Input id="profession" value={form.profession} onChange={(e) => update("profession", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Employment Status</Label>
                  <Select value={form.employment_status} onValueChange={(v) => update("employment_status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Tell the community about yourself..." rows={3} />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creating account..." : "Join Program"}
                  </Button>
                </div>
              </>
            )}
          </form>
          )}
          {mode === "password" && (
            <button
              type="button"
              className="mt-3 block mx-auto text-xs text-muted-foreground hover:text-foreground underline"
              onClick={() => { setMode("magic"); setStep(1); }}
            >
              ← Back to magic-link signup
            </button>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
