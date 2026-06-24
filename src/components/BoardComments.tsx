import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author_name?: string;
  author_photo?: string | null;
};

const timeAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export default function BoardComments({ postId }: { postId: string }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("board_comments")
      .select("id, post_id, author_id, body, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    const ids = Array.from(new Set((data ?? []).map((c) => c.author_id)));
    let map = new Map<string, { name: string; photo_url: string | null }>();
    if (ids.length) {
      const { data: profs } = await (supabase as any)
        .from("members_directory")
        .select("id, name, photo_url")
        .in("id", ids);
      map = new Map(((profs ?? []) as any[]).map((p) => [p.id, { name: p.name, photo_url: p.photo_url }]));
    }
    setComments((data ?? []).map((c) => ({
      ...c,
      author_name: map.get(c.author_id)?.name ?? "Member",
      author_photo: map.get(c.author_id)?.photo_url ?? null,
    })));
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`comments-${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "board_comments", filter: `post_id=eq.${postId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("board_comments").insert({
      post_id: postId,
      author_id: user.id,
      body: body.trim(),
    } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't comment", description: error.message, variant: "destructive" });
    } else {
      setBody("");
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("board_comments").delete().eq("id", id);
    if (error) toast({ title: "Couldn't delete", description: error.message, variant: "destructive" });
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/60 space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2 items-start">
          <Avatar className="h-7 w-7 aspect-square">
            <AvatarImage src={c.author_photo ?? undefined} className="object-cover" />
            <AvatarFallback className="text-[10px]">{c.author_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{c.author_name}</span> · {timeAgo(c.created_at)}
            </p>
            <p className="text-sm whitespace-pre-wrap">{c.body}</p>
          </div>
          {(c.author_id === user?.id || isAdmin) && (
            <button className="text-muted-foreground hover:text-destructive" onClick={() => remove(c.id)}>
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      {user && (
        <form onSubmit={submit} className="flex gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
            rows={1}
            className="resize-none text-sm min-h-[36px]"
          />
          <Button type="submit" size="sm" disabled={submitting || !body.trim()}>Post</Button>
        </form>
      )}
    </div>
  );
}