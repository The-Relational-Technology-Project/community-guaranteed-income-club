import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, MapPin, Briefcase, CheckCircle2, Coffee, MessageCircle, Users, Network, Star, Sparkles, MessageSquare, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NetworkGraph from "@/components/NetworkGraph";
import type { Tables } from "@/integrations/supabase/types";

type RosterProfile = Pick<Tables<"profiles">, "id" | "name" | "bio" | "profession" | "employment_status" | "zip_code" | "photo_url" | "is_verified" | "participant_status"> & {
  favorite_third_space?: string | null;
  open_to_in_person?: boolean | null;
  preferred_contact_method?: string | null;
  contact_handle?: string | null;
  joined_at?: string | null;
  referral_count?: number | null;
  posts_count?: number | null;
  helps_count?: number | null;
  rsvps_count?: number | null;
};

const monthYear = (iso?: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const formatStatus = (s: string | null) => {
  if (!s) return "";
  return s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const Roster = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<RosterProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RosterProfile | null>(null);
  const [tab, setTab] = useState<string>(searchParams.get("filter") === "newcomers" ? "directory" : "directory");
  const [showNewcomers, setShowNewcomers] = useState(searchParams.get("filter") === "newcomers");

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await (supabase as any)
        .from("members_directory")
        .select("id, name, bio, profession, employment_status, zip_code, photo_url, is_verified, participant_status, favorite_third_space, open_to_in_person, preferred_contact_method, contact_handle, joined_at, referral_count, posts_count, helps_count, rsvps_count")
        .eq("participant_status", "active")
        .order("name");
      setProfiles((data ?? []) as RosterProfile[]);
      setLoading(false);
      const memberId = searchParams.get("member");
      if (memberId) {
        const match = ((data ?? []) as RosterProfile[]).find((p) => p.id === memberId);
        if (match) setSelected(match as RosterProfile);
      }
    };
    fetchProfiles();
  }, [searchParams]);

  const filtered = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.profession?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (p.zip_code?.includes(search) ?? false)
  );

  // Newcomers: joined in last 90 days; if none, last 3 by joined_at desc
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const recent = profiles.filter((p) => p.joined_at && new Date(p.joined_at).getTime() >= ninetyDaysAgo);
  const newcomers = recent.length > 0
    ? recent
    : profiles.slice().sort((a, b) => new Date(b.joined_at ?? 0).getTime() - new Date(a.joined_at ?? 0).getTime()).slice(0, 3);
  const visible = showNewcomers ? newcomers : filtered;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Our Club</h1>
          <p className="text-muted-foreground">{profiles.length} active member{profiles.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="directory" className="gap-1.5"><Users className="h-4 w-4" /> Directory</TabsTrigger>
            <TabsTrigger value="network" className="gap-1.5"><Network className="h-4 w-4" /> Network</TabsTrigger>
          </TabsList>
          {tab === "directory" && (
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  const next = !showNewcomers;
                  setShowNewcomers(next);
                  if (next) setSearchParams({ filter: "newcomers" });
                  else { searchParams.delete("filter"); setSearchParams(searchParams); }
                }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-1 ${
                  showNewcomers ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                <Sparkles className="h-3 w-3" /> Newcomers
              </button>
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, profession, ZIP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          )}
        </div>

        <TabsContent value="directory">
          {showNewcomers && (
            <p className="text-sm text-muted-foreground mb-3">
              {recent.length > 0
                ? `${newcomers.length} newcomer${newcomers.length === 1 ? "" : "s"} in the last 90 days — say hi.`
                : `No new members in the last 90 days. Showing the ${newcomers.length} most recent.`}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((profile) => (
          <Card
            key={profile.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelected(profile)}
          >
            <CardContent className="p-4 flex gap-4">
              <Avatar className="h-16 w-16 flex-shrink-0 aspect-square">
                <AvatarImage src={profile.photo_url ?? undefined} className="object-cover" />
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
                  {profile.referral_count && profile.referral_count > 0 ? (
                    <span title={`${profile.referral_count} referrals`} className="flex items-center gap-0.5 text-pop text-xs font-bold">
                      {Array.from({ length: Math.min(profile.referral_count, 3) }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                      ))}
                      {profile.referral_count > 3 && <span className="text-muted-foreground">×{profile.referral_count}</span>}
                    </span>
                  ) : null}
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
                {profile.joined_at && (
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
                    Joined {monthYear(profile.joined_at)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
          </div>

          {visible.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {search ? "No members match your search." : "No active members yet."}
            </div>
          )}
        </TabsContent>

        <TabsContent value="network">
          <NetworkGraph />
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => {
        if (!open) {
          setSelected(null);
          if (searchParams.get("member")) {
            searchParams.delete("member");
            setSearchParams(searchParams, { replace: true });
          }
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Member profile</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <Avatar className="h-24 w-24 aspect-square">
                <AvatarImage src={selected.photo_url ?? undefined} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {selected.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-serif">{selected.name}</h2>
                  {selected.is_verified && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  {selected.referral_count && selected.referral_count > 0 ? (
                    <span title={`${selected.referral_count} referrals`} className="flex items-center gap-0.5">
                      {Array.from({ length: Math.min(selected.referral_count, 5) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </span>
                  ) : null}
                </div>
                {selected.joined_at && (
                  <p className="text-xs text-muted-foreground mt-1">Joined {monthYear(selected.joined_at)}</p>
                )}
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

              <div className="w-full grid grid-cols-3 gap-2 text-center max-w-xs">
                <div className="rounded-md border p-2">
                  <p className="text-lg font-bold">{selected.posts_count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">posts</p>
                </div>
                <div className="rounded-md border p-2">
                  <p className="text-lg font-bold">{selected.helps_count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">helped</p>
                </div>
                <div className="rounded-md border p-2">
                  <p className="text-lg font-bold">{selected.rsvps_count ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">events</p>
                </div>
              </div>

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
                {selected.preferred_contact_method && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Prefers <strong className="text-foreground">{selected.preferred_contact_method.replace("_", " ")}</strong>
                      {selected.contact_handle ? <> · {selected.contact_handle}</> : null}
                    </span>
                  </div>
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
