import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Copy, Apple, Smartphone } from "lucide-react";
import crest from "@/assets/crest.png";

const MemberCard = () => {
  const { user, profile } = useAuth();
  const referralCode = `BMC-${(user?.id ?? "").replace(/-/g, "").slice(-4).toUpperCase() || "0000"}`;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: "Copied", description: `${referralCode} is on your clipboard.` });
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-serif">Your membership card</h1>
        <p className="text-muted-foreground mt-2">
          Show this at gatherings. Share the code with neighbors you'd vouch for.
        </p>
      </header>

      <Card className="card-gradient text-primary-foreground p-6 md:p-8 rounded-2xl border-2 border-accent/40 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-accent/15 pointer-events-none" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="font-serif text-sm opacity-80 leading-tight">The Baltimore</p>
            <p className="font-serif text-2xl text-accent leading-tight">Mutualist Club</p>
          </div>
          <img src={crest} alt="Club crest" className="h-16 w-16 rounded-full ring-2 ring-accent/40 object-cover bg-card" />
        </div>

        <div className="relative mt-10 flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-accent">
            <AvatarImage src={profile?.photo_url ?? undefined} />
            <AvatarFallback className="bg-accent text-accent-foreground font-serif text-xl">
              {profile?.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-serif text-2xl">{profile?.name ?? "Member"}</p>
            <p className="text-xs uppercase tracking-wider opacity-70">Member since {memberSince}</p>
          </div>
        </div>

        <div className="relative mt-8 pt-6 border-t border-primary-foreground/20 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-70">Referral code</p>
            <p className="font-mono text-xl text-accent">{referralCode}</p>
          </div>
          <p className="font-serif text-xs opacity-70 italic">"susu, tanda, hui — carrying it forward."</p>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" onClick={copyCode} className="rounded-full">
          <Copy className="h-4 w-4 mr-2" /> Copy referral code
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => toast({ title: "Coming soon", description: "Wallet pass is on the way — screenshot for now." })}
        >
          <Apple className="h-4 w-4 mr-2" /> Add to Apple Wallet
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => toast({ title: "Coming soon", description: "Wallet pass is on the way — screenshot for now." })}
        >
          <Smartphone className="h-4 w-4 mr-2" /> Add to Google Wallet
        </Button>
      </div>
    </div>
  );
};

export default MemberCard;
