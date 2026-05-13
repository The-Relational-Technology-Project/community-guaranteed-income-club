import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mockBoardPosts, type MockBoardPost } from "@/data/mockMember";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const typeStyle = (t: MockBoardPost["type"]) =>
  t === "offer" ? "bg-success/15 text-success" :
  t === "need" ? "bg-warm/15 text-warm" :
  "bg-accent/25 text-foreground";

const examplePosts: MockBoardPost[] = mockBoardPosts.map((p) => ({ ...p, isExample: true } as any));

const Board = () => {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<MockBoardPost[]>(examplePosts);
  const [filter, setFilter] = useState<"all" | MockBoardPost["type"]>("all");
  const [type, setType] = useState<MockBoardPost["type"]>("offer");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const post: MockBoardPost = {
      id: `post-${Date.now()}`,
      type,
      author: profile?.name ?? "You",
      posted: "just now",
      title,
      body,
    };
    setPosts([post, ...posts]);
    setTitle("");
    setBody("");
    toast({ title: "Posted to the board" });
  };

  const visible = filter === "all" ? posts : posts.filter((p) => p.type === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-serif">Community board</h1>
        <p className="text-muted-foreground mt-2">
          Offers, needs, and job leads from members. Mutual aid beyond money.
        </p>
      </header>

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
            <Button type="submit" className="rounded-full">Post to the board</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-4">
        {(["all", "offer", "need", "lead"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((p) => (
          <Card key={p.id} className={(p as any).isExample ? "border-dashed" : ""}>
            <CardContent className="p-4 flex gap-3">
              <div className="flex flex-col gap-1 items-start">
                <Badge variant="secondary" className={`uppercase text-[10px] tracking-wider ${typeStyle(p.type)}`}>
                  {p.type}
                </Badge>
                {(p as any).isExample && (
                  <Badge variant="outline" className="text-[9px] tracking-wider text-muted-foreground">
                    example
                  </Badge>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{p.title}</p>
                {p.body && <p className="text-sm text-muted-foreground">{p.body}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  —{" "}
                  <Link to="/roster" className="text-primary hover:underline">
                    {p.author}
                  </Link>
                  , {p.posted}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Board;
