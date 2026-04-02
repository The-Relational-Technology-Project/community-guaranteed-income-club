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
import { Camera } from "lucide-react";

const Profile = () => {
  const { profile, refreshProfile, user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    venmo_handle: "",
    zelle_info: "",
    zip_code: "",
    post_tax_monthly_income: "",
    student_loan_payment: "",
    profession: "",
    employment_status: "employed",
    bio: "",
    favorite_third_space: "",
    open_to_in_person: false,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        venmo_handle: profile.venmo_handle ?? "",
        zelle_info: profile.zelle_info ?? "",
        zip_code: profile.zip_code ?? "",
        post_tax_monthly_income: String(profile.post_tax_monthly_income ?? ""),
        student_loan_payment: String(profile.student_loan_payment ?? ""),
        profession: profile.profession ?? "",
        employment_status: profile.employment_status ?? "employed",
        bio: profile.bio ?? "",
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
        venmo_handle: form.venmo_handle || null,
        zelle_info: form.zelle_info || null,
        zip_code: form.zip_code,
        post_tax_monthly_income: parseFloat(form.post_tax_monthly_income),
        student_loan_payment: form.student_loan_payment ? parseFloat(form.student_loan_payment) : 0,
        profession: form.profession || null,
        employment_status: form.employment_status as any,
        bio: form.bio || null,
      })
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
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
