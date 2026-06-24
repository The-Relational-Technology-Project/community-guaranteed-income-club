import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera } from "lucide-react";
import TransactionHistory from "@/components/profile/TransactionHistory";

const Profile = () => {
  const { profile, refreshProfile, user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    payment_method: "venmo",
    payment_handle: "",
    zip_code: "",
    post_tax_monthly_income: "",
    student_loan_payment: "",
    profession: "",
    employment_status: "employed",
    bio: "",
    favorite_third_space: "",
    open_to_in_person: false,
    preferred_contact_method: "",
    contact_handle: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        payment_method: (profile as any).payment_method ?? (profile.venmo_handle ? "venmo" : "venmo"),
        payment_handle: (profile as any).payment_handle ?? profile.venmo_handle ?? profile.zelle_info ?? "",
        zip_code: profile.zip_code ?? "",
        post_tax_monthly_income: String(profile.post_tax_monthly_income ?? ""),
        student_loan_payment: String(profile.student_loan_payment ?? ""),
        profession: profile.profession ?? "",
        employment_status: profile.employment_status ?? "employed",
        bio: profile.bio ?? "",
        favorite_third_space: (profile as any).favorite_third_space ?? "",
        open_to_in_person: (profile as any).open_to_in_person ?? false,
        preferred_contact_method: (profile as any).preferred_contact_method ?? "",
        contact_handle: (profile as any).contact_handle ?? "",
      });
    }
  }, [profile]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        phone: form.phone || null,
        payment_method: form.payment_method || "venmo",
        payment_handle: form.payment_handle || null,
        // Keep venmo_handle mirrored for back-compat with legacy code paths
        venmo_handle: form.payment_method === "venmo" ? (form.payment_handle || null) : null,
        zelle_info: form.payment_method === "zelle" ? (form.payment_handle || null) : null,
        zip_code: form.zip_code,
        post_tax_monthly_income: parseFloat(form.post_tax_monthly_income),
        student_loan_payment: form.student_loan_payment ? parseFloat(form.student_loan_payment) : 0,
        profession: form.profession || null,
        employment_status: form.employment_status as any,
        bio: form.bio || null,
        favorite_third_space: form.favorite_third_space || null,
        open_to_in_person: form.open_to_in_person,
        preferred_contact_method: form.preferred_contact_method || null,
        contact_handle: form.contact_handle || null,
      } as any)
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      await refreshProfile();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    await supabase.from("profiles").update({ photo_url: publicUrl }).eq("id", user.id);
    await refreshProfile();
    setUploading(false);
    toast({ title: "Photo updated!" });
  };

  if (!profile) return null;

  const statusLabel = profile.participant_status === "active"
    ? "Active Participant"
    : profile.participant_status === "waitlisted"
    ? "Waitlisted"
    : "Inactive";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.photo_url ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-primary-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              <div className="flex gap-2 mt-1">
                <Badge variant={profile.participant_status === "active" ? "default" : "secondary"}>
                  {statusLabel}
                </Badge>
                {profile.is_verified && <Badge variant="outline">Verified</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venmo">Venmo Handle</Label>
                <Input id="venmo" value={form.venmo_handle} onChange={(e) => update("venmo_handle", e.target.value)} placeholder="@username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zelle">Zelle Info</Label>
                <Input id="zelle" value={form.zelle_info} onChange={(e) => update("zelle_info", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" value={form.zip_code} onChange={(e) => update("zip_code", e.target.value)} required maxLength={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income">Post-Tax Monthly Income ($)</Label>
                <Input id="income" type="number" value={form.post_tax_monthly_income} onChange={(e) => update("post_tax_monthly_income", e.target.value)} required min={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loans">Student Loan Payment ($)</Label>
                <Input id="loans" type="number" value={form.student_loan_payment} onChange={(e) => update("student_loan_payment", e.target.value)} min={0} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="third_space">Favorite Third Space</Label>
              <Input
                id="third_space"
                value={form.favorite_third_space}
                onChange={(e) => update("favorite_third_space", e.target.value)}
                placeholder="e.g. a café, a park, a walk along the harbor..."
              />
              <p className="text-xs text-muted-foreground">
                A place you'd suggest for meeting another community member — a park, café, walkway, etc.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="open_to_in_person"
                checked={form.open_to_in_person}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, open_to_in_person: !!checked }))}
              />
              <Label htmlFor="open_to_in_person" className="text-sm font-normal cursor-pointer">
                I'm open to exchanging money in person when possible 🤝
              </Label>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-1">Preferred contact</p>
              <p className="text-xs text-muted-foreground mb-3">
                Optional — shown to other Club members so they know how you'd like to be reached.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select
                    value={form.preferred_contact_method || "none"}
                    onValueChange={(v) => update("preferred_contact_method", v === "none" ? "" : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="signal">Signal</SelectItem>
                      <SelectItem value="in_person">In person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_handle">Handle / number</Label>
                  <Input
                    id="contact_handle"
                    value={form.contact_handle}
                    onChange={(e) => update("contact_handle", e.target.value)}
                    placeholder="e.g. signal: @me"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {user && <TransactionHistory userId={user.id} />}
    </div>
  );
};

export default Profile;
