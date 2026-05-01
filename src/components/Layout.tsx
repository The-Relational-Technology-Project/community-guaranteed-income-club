import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import MemberLayout from "@/components/MemberLayout";
import Wordmark, { ClubMark } from "@/components/Wordmark";
import { ORG, CHAPTER } from "@/lib/chapter";

const PUBLIC_ROUTES = ["/", "/about", "/login", "/signup", "/demo"];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isPublic = PUBLIC_ROUTES.includes(location.pathname);

  // Authenticated user landing on "/" → send to /home
  if (!loading && user && location.pathname === "/") {
    return <Navigate to="/home" replace />;
  }

  // Authenticated, internal route → use MemberLayout
  if (!loading && user && !isPublic) {
    return <MemberLayout>{children}</MemberLayout>;
  }

  // Public marketing chrome
  return (
    <div className="min-h-screen flex flex-col font-body">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          {/* Compact mark on mobile, full wordmark on sm+ */}
          <Link to="/" aria-label={`${ORG.name} home`} className="flex items-center gap-2 min-w-0 sm:hidden">
            <ClubMark size={30} />
            <span className="font-display font-bold text-[15px] leading-tight tracking-tight truncate">
              CGIC <span className="text-muted-foreground font-medium">· {CHAPTER.name}</span>
            </span>
          </Link>
          <div className="hidden sm:block">
            <Wordmark to="/" />
          </div>
          <nav className="flex items-center gap-1 shrink-0">
            <Link to="/about" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="rounded-full">About</Button>
            </Link>
            {user ? (
              <Link to="/home"><Button size="sm" className="rounded-full">My home</Button></Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-full px-3">Sign in</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="rounded-full px-4 whitespace-nowrap">Join</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/50 py-8 px-4 bg-secondary/30">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClubMark size={22} />
            <span className="font-display font-bold text-sm">{ORG.name} · {CHAPTER.name}</span>
          </div>
          <p className="text-xs text-muted-foreground font-serif italic">
            "All flourishing is mutual."
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
