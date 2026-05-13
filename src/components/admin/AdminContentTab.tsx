import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, GripVertical, Trash2, Save } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const AdminContentTab = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("*")
      .eq("section", "faq")
      .order("sort_order");
    setItems(data ?? []);
    setLoading(false);
    setDirty(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateItem = (id: string, field: "title" | "body", value: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
    setDirty(true);
  };

  const addItem = () => {
    const maxOrder = items.reduce((max, item) => Math.max(max, item.sort_order), 0);
    const newItem: SiteContent = {
      id: `new-${Date.now()}`,
      section: "faq",
      sort_order: maxOrder + 1,
      title: "",
      body: "",
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    };
    setItems([...items, newItem]);
    setDirty(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setDirty(true);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newItems = [...items];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    newItems.forEach((item, i) => { item.sort_order = i + 1; });
    setItems(newItems);
    setDirty(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from("site_content")
      .select("id")
      .eq("section", "faq");
    const existingIds = new Set((existing ?? []).map((e) => e.id));
    const currentIds = new Set(items.filter((i) => !i.id.startsWith("new-")).map((i) => i.id));

    const toDelete = [...existingIds].filter((id) => !currentIds.has(id));
    if (toDelete.length > 0) {
      await supabase.from("site_content").delete().in("id", toDelete);
    }

    for (const item of items) {
      if (item.id.startsWith("new-")) {
        await supabase.from("site_content").insert({
          section: "faq",
          sort_order: item.sort_order,
          title: item.title,
          body: item.body,
          updated_by: user.id,
        });
      } else {
        await supabase
          .from("site_content")
          .update({
            title: item.title,
            body: item.body,
            sort_order: item.sort_order,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("id", item.id);
      }
    }

    setSaving(false);
    toast({ title: "FAQ saved" });
    fetchItems();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">FAQ items</CardTitle>
          <p className="text-sm text-muted-foreground">
            These appear on the About page. Visitors and members can see them.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id} className="border bg-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={item.title ?? ""}
                      onChange={(e) => updateItem(item.id, "title", e.target.value)}
                      placeholder="Question"
                      className="font-medium"
                    />
                    <Textarea
                      value={item.body}
                      onChange={(e) => updateItem(item.id, "body", e.target.value)}
                      placeholder="Answer"
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-3">
            <Button variant="outline" onClick={addItem} className="gap-2">
              <Plus className="h-4 w-4" /> Add question
            </Button>
            <Button onClick={handleSave} disabled={!dirty || saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContentTab;
