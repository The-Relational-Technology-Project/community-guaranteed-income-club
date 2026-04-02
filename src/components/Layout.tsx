import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, LayoutDashboard, ArrowLeftRight, Settings, LogOut, Menu, X, Heart } from "lucide-react";
import { useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { to: "/roster", label: "Roster", icon: Users },
    { to: "/transactions", label: "My Transactions", icon: ArrowLeftRight },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: LayoutDashboard }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-body">
      <header className="border-b border-border/50 bg-card/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Heart className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Baltimore <span className="text-primary">GI</span>
            </span>
          </Link>

          {user ? (
            <>
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant={isActive(link.to) ? "default" : "ghost"}
                      size="sm"
                      className={`gap-2 rounded-full font-medium ${isActive(link.to) ? "" : "hover:bg-secondary"}`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2 rounded-full">
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarImage src={profile?.photo_url ?? undefined} />
                        <AvatarFallback className="text-xs bg-accent text-accent-foreground font-bold">
                          {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium">{profile?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-lg">
                      <Settings className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-lg">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-full font-medium">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-full font-display font-semibold shadow-sm">
                  Join the Movement
                </Button>
              </Link>
            </div>
          )}
        </div>

        {mobileOpen && user && (
          <nav className="md:hidden border-t border-border/50 px-4 py-2 flex flex-col gap-1 bg-card">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={isActive(link.to) ? "default" : "ghost"}
                  className="w-full justify-start gap-2 rounded-xl"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-3.5 w-3.5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-sm font-display font-semibold">Baltimore Community GI</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Building community through shared prosperity · Made with 💛 in Baltimore
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/roster" className="text-muted-foreground hover:text-foreground transition-colors">Roster</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
