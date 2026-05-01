import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Wordmark, { ClubMark } from "@/components/Wordmark";
import { CHAPTER } from "@/lib/chapter";
import {
  Home,
  Users,
  CreditCard,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/roster", label: "Roster", icon: Users },
    { to: "/card", label: "Card", icon: CreditCard },
    { to: "/events", label: "Events", icon: Calendar },
    { to: "/board", label: "Board", icon: MessageSquare },
  ];
  const mobileLinks = isAdmin
    ? [...links, { to: "/admin", label: "Admin", icon: ShieldCheck }]
    : links;

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <Link to="/home" className="px-5 py-6 border-b border-sidebar-border block">
          <div className="flex items-center gap-2">
            <ClubMark size={32} />
            <div className="leading-tight">
              <p className="font-display font-bold text-xs text-sidebar-foreground/80">Community Guaranteed</p>
              <p className="font-display font-bold text-lg text-sidebar-primary">Income Club</p>
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 mt-0.5">{CHAPTER.name} chapter</p>
            </div>
          </div>
        </Link>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive(l.to)
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "hover:bg-sidebar-accent/60"
                }`}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </div>
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive("/admin")
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "hover:bg-sidebar-accent/60"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </div>
            </Link>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link to="/profile">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent/60">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile?.photo_url ?? undefined} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {profile?.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{profile?.name ?? "Profile"}</span>
              <Settings className="h-3.5 w-3.5 ml-auto opacity-60" />
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent/60"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between border-b border-sidebar-border">
        <Link to="/home" className="flex items-center gap-2">
          <ClubMark size={24} />
          <p className="font-display font-bold text-base leading-tight">CGI Club <span className="text-xs font-medium text-sidebar-foreground/70">· {CHAPTER.name}</span></p>
        </Link>
        <Link to="/profile">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.photo_url ?? undefined} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {profile?.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border flex justify-around py-2 z-40">
        {mobileLinks.map((l) => (
          <Link key={l.to} to={l.to} className="flex-1">
            <div
              className={`flex flex-col items-center gap-0.5 py-1 text-[11px] ${
                isActive(l.to) ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MemberLayout;
