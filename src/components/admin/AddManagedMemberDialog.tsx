import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const AddManagedMemberDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    zip_code: "",
    contact_method: "phone",
    contact_notes: "",
    post_tax_monthly_income: "",
    venmo_handle: "",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const { data, error } = await supabase.functions.invoke("admin-create-managed-member", {
      body: {
        name: form.name.trim(),
        phone: form.phone || null,
        zip_code: form.zip_code || null,
        contact_method: form.contact_method,
        contact_notes: form.contact_notes || null,
        post_tax_monthly_income: form.post_tax_monthly_income
          ? parseFloat(form.post_tax_monthly_income)
          : 0,
        venmo_handle: form.venmo_handle || null,
      },
    });

    setSaving(false);

    if (error || (data as any)?.error) {
      toast({
        title: "Could not add member",
        description: error?.message ?? JSON.stringify((data as any)?.error),
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Member added", description: `${form.name} is now active.` });
    setForm({
      name: "",
      phone: "",
      zip_code: "",
      contact_method: "phone",
      contact_notes: "",
      post_tax_monthly_income: "",
      venmo_handle: "",
    });
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add member without email</DialogTitle>
          <DialogDescription>
            For people you'll coordinate with by phone or in person. You'll confirm
            their transactions on their behalf each month.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="m-name">Full name *</Label>
            <Input id="m-name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-phone">Phone</Label>
              <Input id="m-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-zip">ZIP</Label>
              <Input id="m-zip" value={form.zip_code} onChange={(e) => update("zip_code", e.target.value)} maxLength={5} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Contact method</Label>
              <Select value={form.contact_method} onValueChange={(v) => update("contact_method", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone / SMS</SelectItem>
                  <SelectItem value="in_person">In person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-venmo">Venmo handle</Label>
              <Input id="m-venmo" value={form.venmo_handle} onChange={(e) => update("venmo_handle", e.target.value)} placeholder="@username" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-income">Post-tax monthly income ($)</Label>
            <Input
              id="m-income"
              type="number"
              min={0}
              value={form.post_tax_monthly_income}
              onChange={(e) => update("post_tax_monthly_income", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-notes">Contact notes</Label>
            <Textarea
              id="m-notes"
              rows={3}
              placeholder="e.g. Call Tuesdays after 5pm. Drops by the library."
              value={form.contact_notes}
              onChange={(e) => update("contact_notes", e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? "Adding…" : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddManagedMemberDialog;