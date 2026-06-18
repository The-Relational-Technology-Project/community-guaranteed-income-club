import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Node = { id: string; degree: number };
type Link = { source: string; target: string; kind: "transaction" | "event" | "help"; weight: number };

const COLORS = {
  transaction: "hsl(var(--primary))",
  event: "hsl(var(--accent, 38 92% 50%))",
  help: "hsl(142 70% 45%)",
};

export default function NetworkGraph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 500 });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const update = () => {
      if (wrapRef.current) {
        const r = wrapRef.current.getBoundingClientRect();
        setSize({ w: Math.max(320, r.width), h: 560 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    (async () => {
      const [{ data: profs }, { data: txs }, { data: rsvps }, { data: posts }] = await Promise.all([
        supabase.from("profiles").select("id").eq("participant_status", "active"),
        supabase.from("transactions").select("sender_id, receiver_id"),
        supabase.from("event_rsvps").select("event_id, user_id"),
        supabase.from("board_posts").select("author_id, helped_by").not("helped_by", "is", null),
      ]);

      const active = new Set((profs ?? []).map((p) => p.id));
      const edgeMap = new Map<string, Link>();
      const addEdge = (a: string, b: string, kind: Link["kind"]) => {
        if (!a || !b || a === b) return;
        if (!active.has(a) || !active.has(b)) return;
        const [x, y] = a < b ? [a, b] : [b, a];
        const key = `${x}|${y}|${kind}`;
        const cur = edgeMap.get(key);
        if (cur) cur.weight += 1;
        else edgeMap.set(key, { source: x, target: y, kind, weight: 1 });
      };

      (txs ?? []).forEach((t: any) => addEdge(t.sender_id, t.receiver_id, "transaction"));

      // co-attendance: pair members per event
      const byEvent = new Map<string, string[]>();
      (rsvps ?? []).forEach((r: any) => {
        const list = byEvent.get(r.event_id) ?? [];
        list.push(r.user_id);
        byEvent.set(r.event_id, list);
      });
      byEvent.forEach((users) => {
        for (let i = 0; i < users.length; i++)
          for (let j = i + 1; j < users.length; j++) addEdge(users[i], users[j], "event");
      });

      (posts ?? []).forEach((p: any) => addEdge(p.author_id, p.helped_by, "help"));

      const linkArr = Array.from(edgeMap.values());
      const degree = new Map<string, number>();
      linkArr.forEach((l) => {
        degree.set(l.source as string, (degree.get(l.source as string) ?? 0) + l.weight);
        degree.set(l.target as string, (degree.get(l.target as string) ?? 0) + l.weight);
      });
      const nodeArr: Node[] = Array.from(active).map((id) => ({ id, degree: degree.get(id) ?? 0 }));

      setNodes(nodeArr);
      setLinks(linkArr);
      setLoading(false);
    })();
  }, []);

  const data = useMemo(() => ({ nodes, links }), [nodes, links]);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Connection map</h2>
            <p className="text-sm text-muted-foreground">
              Each dot is a member (anonymous). Lines connect people who've moved money, gathered, or helped each other.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge style={{ background: COLORS.transaction, color: "white" }}>Transactions</Badge>
            <Badge style={{ background: COLORS.event, color: "white" }}>Gatherings</Badge>
            <Badge style={{ background: COLORS.help, color: "white" }}>Offers &amp; needs</Badge>
          </div>
        </div>
        <div ref={wrapRef} className="w-full rounded-lg border bg-muted/20 overflow-hidden">
          {loading ? (
            <div className="h-[560px] flex items-center justify-center text-muted-foreground text-sm">
              Loading connections…
            </div>
          ) : nodes.length === 0 ? (
            <div className="h-[560px] flex items-center justify-center text-muted-foreground text-sm">
              No active members yet.
            </div>
          ) : (
            <ForceGraph2D
              graphData={data}
              width={size.w}
              height={size.h}
              nodeRelSize={4}
              nodeVal={(n: any) => 1 + (n.degree ?? 0)}
              nodeColor={(n: any) =>
                n.degree > 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
              }
              nodeLabel={() => ""}
              linkColor={(l: any) => COLORS[l.kind as keyof typeof COLORS]}
              linkWidth={(l: any) => Math.min(4, 0.5 + l.weight * 0.5)}
              linkDirectionalParticles={0}
              cooldownTicks={80}
              enableNodeDrag={false}
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {nodes.length} members · {links.length} connections. No names or identifiers are shown.
        </p>
      </CardContent>
    </Card>
  );
}