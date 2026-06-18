import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Save } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const SectionEditor = ({ section, label }: { section: string; label: string }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase.from("site_content").select("*").eq("section", section).order("sort_order");
    setItems(data ?? []);
    setLoading(false);
    setDirty(false);
  };

  useEffect(() => { fetchItems(); }, [section]);

  const updateItem = (id: string, field: "title" | "body", value: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
    setDirty(true);
  };

  const addItem = () => {
    const maxOrder = items.reduce((m, i) => Math.max(m, i.sort_order), 0);
    setItems([...items, { id: `new-${Date.now()}`, section, sort_order: maxOrder + 1, title: "", body: "", updated_at: new Date().toISOString(), updated_by: user?.id ?? null } as SiteContent]);
    setDirty(true);
  };

  const removeItem = (id: string) => { setItems((prev) => prev.filter((i) => i.id !== id)); setDirty(true); };

  const moveItem = (index: number, direction: -1 | 1) => {
    const next = [...items];
    const swap = index + direction;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    next.forEach((i, idx) => { i.sort_order = idx + 1; });
    setItems(next);
    setDirty(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { data: existing } = await supabase.from("site_content").select("id").eq("section", section);
    const existingIds = new Set((existing ?? []).map((e) => e.id));
    const currentIds = new Set(items.filter((i) => !i.id.startsWith("new-")).map((i) => i.id));
    const toDelete = [...existingIds].filter((id) => !currentIds.has(id));
    if (toDelete.length > 0) await supabase.from("site_content").delete().in("id", toDelete);
    for (const item of items) {
      if (item.id.startsWith("new-")) {
        await supabase.from("site_content").insert({ section, sort_order: item.sort_order, title: item.title, body: item.body, updated_by: user.id });
      } else {
        await supabase.from("site_content").update({ title: item.title, body: item.body, sort_order: item.sort_order, updated_at: new Date().toISOString(), updated_by: user.id }).eq("id", item.id);
      }
    }
    setSaving(false);
    toast({ title: `${label} saved` });
    fetchItems();
  };

  if (loading) return <div className="flex items-center justify-center min-h-[30vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{label}</CardTitle>
        <p className="text-sm text-muted-foreground">Edits show on the public page.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <Card key={item.id} className="border bg-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▲</button>
                  <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▼</button>
                </div>
                <div className="flex-1 space-y-2">
                  <Input value={item.title ?? ""} onChange={(e) => updateItem(item.id, "title", e.target.value)} placeholder="Title" className="font-medium" />
                  <Textarea value={item.body} onChange={(e) => updateItem(item.id, "body", e.target.value)} placeholder="Body" rows={section === "about" ? 6 : 2} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex gap-3">
          <Button variant="outline" onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Add item</Button>
          <Button onClick={handleSave} disabled={!dirty || saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminContentTab = () => (
  <Tabs defaultValue="about" className="space-y-6">
    <TabsList>
      <TabsTrigger value="about">About page</TabsTrigger>
      <TabsTrigger value="faq">FAQ</TabsTrigger>
    </TabsList>
    <TabsContent value="about"><SectionEditor section="about" label="About page sections" /></TabsContent>
    <TabsContent value="faq"><SectionEditor section="faq" label="FAQ items" /></TabsContent>
  </Tabs>
);

export default AdminContentTab;
