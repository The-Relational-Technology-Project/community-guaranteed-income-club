import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, MapPin, Briefcase, CheckCircle2, Coffee, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type RosterProfile = Pick<Tables<"profiles">, "id" | "name" | "bio" | "profession" | "employment_status" | "zip_code" | "photo_url" | "is_verified" | "participant_status"> & {
  favorite_third_space?: string | null;
  open_to_in_person?: boolean | null;
};

const formatStatus = (s: string | null) => {
  if (!s) return "";
  return s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const Roster = () => {
  const [profiles, setProfiles] = useState<RosterProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RosterProfile | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, bio, profession, employment_status, zip_code, photo_url, is_verified, participant_status, favorite_third_space, open_to_in_person")
        .eq("participant_status", "active")
        .order("name");
      setProfiles(data ?? []);
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  const filtered = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.profession?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (p.zip_code?.includes(search) ?? false)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Roster</h1>
          <p className="text-muted-foreground">{profiles.length} active members</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, profession, ZIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((profile) => (
          <Card
            key={profile.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelected(profile)}
          >
            <CardContent className="p-4 flex gap-4">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarImage src={profile.photo_url ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold truncate">{profile.name}</h3>
                  {profile.is_verified && (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                {profile.profession && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{profile.profession}</span>
                  </div>
                )}
                {profile.zip_code && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{profile.zip_code}</span>
                  </div>
                )}
                {profile.favorite_third_space && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Coffee className="h-3 w-3" />
                    <span className="truncate">{profile.favorite_third_space}</span>
                  </div>
                )}
                {profile.bio && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{profile.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "No members match your search." : "No active members yet."}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Member profile</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={selected.photo_url ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {selected.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-serif">{selected.name}</h2>
                  {selected.is_verified && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {selected.profession && (
                    <Badge variant="secondary" className="gap-1">
                      <Briefcase className="h-3 w-3" /> {selected.profession}
                    </Badge>
                  )}
                  {selected.employment_status && (
                    <Badge variant="outline">{formatStatus(selected.employment_status)}</Badge>
                  )}
                </div>
              </div>

              {selected.bio && (
                <p className="text-muted-foreground leading-relaxed max-w-sm">{selected.bio}</p>
              )}

              <div className="w-full space-y-2 text-sm text-left max-w-xs">
                {selected.zip_code && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>ZIP {selected.zip_code}</span>
                  </div>
                )}
                {selected.favorite_third_space && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Coffee className="h-4 w-4 flex-shrink-0" />
                    <span>{selected.favorite_third_space}</span>
                  </div>
                )}
                {selected.open_to_in_person && (
                  <Badge className="bg-fresh/15 text-fresh border-fresh/30">Open to meeting in person</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roster;
