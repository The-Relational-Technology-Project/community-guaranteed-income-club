import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase, CheckCircle2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const Roster = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, bio, profession, employment_status, zip_code, photo_url, is_verified, participant_status")
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

  const formatStatus = (s: string | null) => {
    if (!s) return "";
    return s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

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
          <Card key={profile.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                {profile.employment_status && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {formatStatus(profile.employment_status)}
                  </Badge>
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
    </div>
  );
};

export default Roster;
