import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = {
  id: string;
  created_at: string;
  requester_id: string;
  matched_id: string;
  requester_name?: string;
  matched_name?: string;
};

export default function AdminCheckInsCard() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("neighbor_checkins")
        .select("id, created_at, requester_id, matched_id")
        .order("created_at", { ascending: false })
        .limit(50);
      const ids = Array.from(new Set((data ?? []).flatMap((c) => [c.requester_id, c.matched_id])));
      let map = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await (supabase as any)
          .from("members_directory")
          .select("id, name")
          .in("id", ids);
        map = new Map(((profs ?? []) as any[]).map((p) => [p.id, p.name]));
      }
      setRows((data ?? []).map((c) => ({
        ...c,
        requester_name: map.get(c.requester_id) ?? "—",
        matched_name: map.get(c.matched_id) ?? "—",
      })));
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neighbor check-ins</CardTitle>
        <CardDescription>The 50 most recent "check in on a neighbor" pairings.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No check-ins yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Matched with</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{r.requester_name}</TableCell>
                  <TableCell>{r.matched_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}