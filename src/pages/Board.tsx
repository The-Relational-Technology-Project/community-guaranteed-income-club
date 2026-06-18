import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Archive, CheckCircle2 } from "lucide-react";

type PostType = "offer" | "need" | "lead";

type BoardPost = {
  id: string;
  type: PostType;
  title: string;
  body: string | null;
  author_id: string;
  created_at: string;
  author_name?: string;
  is_example?: boolean;
  archived_at?: string | null;
  helped_by?: string | null;
  helped_by_name?: string | null;
};

const typeStyle = (t: PostType) =>
  t === "offer" ? "bg-success/15 text-success" :
  t === "need" ? "bg-warm/15 text-warm" :
  "bg-accent/25 text-foreground";

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const Board = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const initialFilter = (searchParams.get("filter") as any) || "all";
  const [filter, setFilter] = useState<"all" | PostType>(["all","offer","need","lead"].includes(initialFilter) ? initialFilter : "all");
  const [type, setType] = useState<PostType>("offer");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archiving, setArchiving] = useState<BoardPost | null>(null);
  const [helpedBy, setHelpedBy] = useState<string>("none");
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("board_posts")
      .select("id, type, title, body, author_id, created_at, is_example, archived_at, helped_by")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Couldn't load board", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const ids = Array.from(new Set([
      ...(data ?? []).map((p) => p.author_id),
      ...(data ?? []).map((p: any) => p.helped_by).filter(Boolean),
    ]));
    let nameMap = new Map<string, string>();
    if (ids.length) {
      const { data: profs } = await (supabase as any).from("members_directory").select("id, name").in("id", ids);
      nameMap = new Map(((profs ?? []) as Array<{ id: string; name: string }>).map((p) => [p.id, p.name]));
    }
    setPosts((data ?? []).map((p: any) => ({
      ...p,
      author_name: nameMap.get(p.author_id) ?? "Member",
      helped_by_name: p.helped_by ? nameMap.get(p.helped_by) ?? null : null,
    })));
    setLoading(false);
  };

  const loadMembers = async () => {
    const { data } = await (supabase as any)
      .from("members_directory")
      .select("id, name")
      .eq("participant_status", "active")
      .order("name");
    setMembers((data ?? []) as Array<{ id: string; name: string }>);
  };

  useEffect(() => {
    load();
    loadMembers();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("board_posts").insert({
      type,
      title: title.trim(),
      body: body.trim() || null,
      author_id: user.id,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't post", description: error.message, variant: "destructive" });
      return;
    }
    setTitle("");
    setBody("");
    toast({ title: "Posted to the board" });
    load();
  };

  const visible = filter === "all" ? posts : posts.filter((p) => p.type === filter);
  const filteredByArchive = visible.filter((p) =>
    showArchived ? !!p.archived_at : !p.archived_at
  );

  const canArchive = (p: BoardPost) => user && (p.author_id === user.id || isAdmin) && !p.archived_at;

  const openArchive = (p: BoardPost) => {
    setArchiving(p);
    setHelpedBy("none");
  };

  const confirmArchive = async () => {
    if (!archiving || !user) return;
    const { error } = await supabase
      .from("board_posts")
      .update({
        archived_at: new Date().toISOString(),
        archived_by: user.id,
        helped_by: helpedBy === "none" ? null : helpedBy,
      })
      .eq("id", archiving.id);
    if (error) {
      toast({ title: "Couldn't archive", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Archived 💛" });
      setArchiving(null);
      load();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-serif">Community board</h1>
        <p className="text-muted-foreground mt-2">
          Offers, needs, and job leads from members. Mutual aid beyond money.
        </p>
      </header>

      {user && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <form onSubmit={submit} className="space-y-3">
              <div className="flex gap-2">
                {(["offer", "need", "lead"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider ${
                      type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Details…" value={body} onChange={(e) => setBody(e.target.value)} rows={2} />
              <Button type="submit" className="rounded-full" disabled={submitting || !title.trim()}>
                {submitting ? "Posting…" : "Post to the board"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-4">
        {(["all", "offer", "need", "lead"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setSearchParams(f === "all" ? {} : { filter: f }); }}
            className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        {isAdmin && (
          <button
            onClick={() => setShowArchived((v) => !v)}
            className={`ml-auto px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
              showArchived ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
            }`}
          >
            {showArchived ? "Showing archived" : "Show archived"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && filteredByArchive.length === 0 && (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        )}
        {filteredByArchive.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex gap-3">
              <div className="flex flex-col gap-1 items-start">
                <Badge variant="secondary" className={`uppercase text-[10px] tracking-wider ${typeStyle(p.type)}`}>
                  {p.type}
                </Badge>
                {p.is_example && (
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider">Example</Badge>
                )}
                {p.archived_at && (
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Done
                  </Badge>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{p.title}</p>
                {p.body && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.body}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  —{" "}
                  <Link to={`/roster?member=${p.author_id}`} className="text-primary hover:underline">
                    {p.author_name}
                  </Link>
                  , {timeAgo(p.created_at)}
                  {p.helped_by_name && <> · helped by <span className="text-foreground">{p.helped_by_name}</span></>}
                </p>
              </div>
              {canArchive(p) && (
                <Button variant="ghost" size="sm" className="self-start" onClick={() => openArchive(p)}>
                  <Archive className="h-3.5 w-3.5 mr-1" /> Archive
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!archiving} onOpenChange={(o) => !o && setArchiving(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark as done</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm">Who helped / took this up? (optional)</Label>
            <Select value={helpedBy} onValueChange={setHelpedBy}>
              <SelectTrigger><SelectValue placeholder="Nobody to credit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nobody / skip</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiving(null)}>Cancel</Button>
            <Button onClick={confirmArchive}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Board;