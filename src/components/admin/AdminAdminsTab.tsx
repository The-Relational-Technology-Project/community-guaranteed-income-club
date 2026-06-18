import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ShieldPlus, ShieldOff } from "lucide-react";

type AdminRow = { user_id: string; name: string | null; email: string | null };
type AllowRow = { email: string };

const AdminAdminsTab = () => {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [allowlist, setAllowlist] = useState<AllowRow[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, name, email").in("id", ids);
      setAdmins((profs ?? []).map((p) => ({ user_id: p.id, name: p.name, email: p.email })));
    } else setAdmins([]);
    const { data: allow } = await supabase.from("admin_allowlist").select("email").order("email");
    setAllowlist(allow ?? []);
  };

  useEffect(() => { load(); }, []);

  const addAdmin = async () => {
    if (!email.trim()) return;
    setBusy(true);
    const lower = email.trim().toLowerCase();
    const { error: insErr } = await supabase.from("admin_allowlist").insert({ email: lower });
    if (insErr && !insErr.message.includes("duplicate")) {
      toast({ title: "Couldn't add to allowlist", description: insErr.message, variant: "destructive" });
      setBusy(false);
      return;
    }
    const { data: promoted, error } = await supabase.rpc("promote_existing_admin", { _email: lower });
    setBusy(false);
    if (error) toast({ title: "Promotion failed", description: error.message, variant: "destructive" });
    else if (promoted) toast({ title: "Admin added", description: `${lower} is now an admin.` });
    else toast({ title: "Added to allowlist", description: `${lower} will become admin on signup.` });
    setEmail("");
    load();
  };

  const revoke = async (userId: string, email: string | null) => {
    if (!confirm(`Remove admin access for ${email ?? userId}?`)) return;
    const { error } = await supabase.rpc("revoke_admin", { _user_id: userId });
    if (error) toast({ title: "Couldn't revoke", description: error.message, variant: "destructive" });
    else { toast({ title: "Admin revoked" }); load(); }
  };

  const removeAllowlist = async (email: string) => {
    await supabase.from("admin_allowlist").delete().eq("email", email);
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldPlus className="h-5 w-5" /> Add an admin</CardTitle>
          <CardDescription>
            Enter the email of an existing member to promote them immediately, or of someone who hasn't signed up yet — they'll become admin automatically when they create their account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" />
            <Button onClick={addAdmin} disabled={busy || !email.trim()}>Add admin</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Current admins ({admins.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead className="w-32"></TableHead></TableRow></TableHeader>
            <TableBody>
              {admins.map((a) => (
                <TableRow key={a.user_id}>
                  <TableCell className="font-medium">{a.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.email}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="text-destructive gap-1" onClick={() => revoke(a.user_id, a.email)}>
                      <ShieldOff className="h-3.5 w-3.5" /> Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending allowlist</CardTitle>
          <CardDescription>These emails will be promoted to admin the first time they sign up.</CardDescription>
        </CardHeader>
        <CardContent>
          {allowlist.length === 0 ? <p className="text-sm text-muted-foreground">No pending entries.</p> : (
            <ul className="space-y-2">
              {allowlist.map((a) => (
                <li key={a.email} className="flex items-center justify-between text-sm">
                  <span>{a.email}</span>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeAllowlist(a.email)}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdminsTab;
