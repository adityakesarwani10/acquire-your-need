import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, LogOut, Shield, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function Navbar({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className={`sticky top-0 z-40 ${isDark ? "bg-navy/70 border-white/10" : "bg-background/70 border-border"} border-b backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[color:var(--color-primary-glow)] flex items-center justify-center shadow-[0_4px_16px_-4px_rgba(29,158,117,0.6)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className={`font-bold tracking-tight ${isDark ? "text-white" : "text-foreground"}`}>
            Acquire·Your·Need
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link to="/search" className={`${isDark ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition`}>Find workers</Link>
          {user?.role !== "admin" && (
            <Link to="/dashboard" className={`${isDark ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition`}>Dashboard</Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className={`${isDark ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition flex items-center gap-1`}>
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
          <Link to="/signup" className={`${isDark ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition`}>Become a pro</Link>
        </nav>
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link to="/login" className={`hidden sm:inline-flex text-sm px-3 py-2 rounded-lg ${isDark ? "text-white/80 hover:bg-white/10" : "text-foreground hover:bg-secondary"} transition`}>
                Sign in
              </Link>
              <Link to="/search" className="inline-flex text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition shadow-[0_4px_14px_-4px_rgba(29,158,117,0.5)]">
                Get started
              </Link>
            </>
          ) : (
            <div ref={ref} className="relative">
              <button onClick={() => setOpen(!open)}
                className={`inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-secondary text-foreground"} transition`}>
                <img src={user.avatar} alt="" className="w-7 h-7 rounded-md bg-muted" />
                <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 card-soft p-1.5 shadow-elevated z-50 bg-card">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <div className="text-sm font-medium truncate text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    {user.role === "admin" && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wider">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    )}
                  </div>
                  <Link to={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-secondary text-foreground transition">
                    <LayoutDashboard className="w-4 h-4" /> {user.role === "admin" ? "Admin console" : "Dashboard"}
                  </Link>
                  <button onClick={() => { logout(); setOpen(false); navigate({ to: "/" }); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-secondary text-foreground transition">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
