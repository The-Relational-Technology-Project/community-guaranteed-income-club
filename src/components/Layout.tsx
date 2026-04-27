import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import MemberLayout from "@/components/MemberLayout";
import crest from "@/assets/crest.png";

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
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={crest} alt="Crest" className="h-9 w-9 rounded-full ring-1 ring-accent/40 object-cover bg-card" />
            <span className="font-serif text-lg leading-tight">
              The Baltimore <span className="text-accent">Mutualist Club</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/about"><Button variant="ghost" size="sm" className="rounded-full">About</Button></Link>
            {user ? (
              <Link to="/home"><Button size="sm" className="rounded-full">My home</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm" className="rounded-full">Sign in</Button></Link>
                <Link to="/signup"><Button size="sm" className="rounded-full">Join the Club</Button></Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/50 py-8 px-4 bg-secondary/30">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={crest} alt="" className="h-6 w-6 rounded-full object-cover" />
            <span className="font-serif text-sm">The Baltimore Mutualist Club</span>
          </div>
          <p className="text-xs text-muted-foreground font-serif italic">
            "All flourishing is mutual."
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            <Link to="/demo" className="text-muted-foreground hover:text-foreground">Try a live demo →</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
