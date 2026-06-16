import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Navbar({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
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
          {[
            { to: "/search", label: "Find workers" },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/signup", label: "Become a pro" },
          ].map((l) => (
            <Link key={l.to} to={l.to} className={`${isDark ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className={`hidden sm:inline-flex text-sm px-3 py-2 rounded-lg ${isDark ? "text-white/80 hover:bg-white/10" : "text-foreground hover:bg-secondary"} transition`}>
            Sign in
          </Link>
          <Link to="/search" className="inline-flex text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition shadow-[0_4px_14px_-4px_rgba(29,158,117,0.5)]">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
