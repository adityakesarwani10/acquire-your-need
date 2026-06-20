import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Search as SearchIcon, Briefcase, MessageSquare, Settings,
  Sparkles, TrendingUp, Wallet, Star, ArrowUpRight, Plus, Bell, Clock, Loader2,
} from "lucide-react";
import { WorkerCard } from "@/components/WorkerCard";
import { apiSearchWorkers, workerFromRaw } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Worker } from "@/lib/mock-data";

const NAV = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Find workers", icon: SearchIcon },
  { label: "My hires", icon: Briefcase },
  { label: "Messages", icon: MessageSquare },
  { label: "Settings", icon: Settings },
];

const ACTIVITY = [
  { t: "Hired Ravi Kumar for electrical work", time: "2h ago", color: "primary" },
  { t: "Left a 5★ review for Priya Sharma", time: "Yesterday", color: "amber" },
  { t: "Job completed: Wardrobe install by Mohammed Faiz", time: "3 days ago", color: "primary" },
  { t: "Quote received from Anjali Reddy", time: "5 days ago", color: "navy" },
];

export default function Dashboard() {
  useEffect(() => { document.title = "Dashboard — Acquire·Your·Need"; }, []);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const [recommended, setRecommended] = useState<Worker[]>([]);
  const [loadingRec, setLoadingRec] = useState(true);

  // Top 3 ML-ranked workers, used as "Recommended for you"
  useEffect(() => {
    apiSearchWorkers({})
      .then((res) => setRecommended(res.workers.slice(0, 3).map(workerFromRaw)))
      .catch(() => setRecommended([]))
      .finally(() => setLoadingRec(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-0 lg:h-screen border-r border-border bg-card flex lg:flex-col">
          <div className="p-6 hidden lg:block">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[color:var(--color-primary-glow)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">Acquire·Your·Need</span>
            </Link>
          </div>
          <nav className="flex lg:flex-col gap-1 px-3 py-3 lg:py-0 flex-1 overflow-x-auto">
            {NAV.map((n) => (
              <button key={n.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition whitespace-nowrap ${n.active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <n.icon className="w-4 h-4" /> <span className="hidden sm:inline">{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="hidden lg:block p-4 m-4 rounded-xl bg-navy text-navy-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
            <div className="relative">
              <div className="text-xs text-white/60">Premium</div>
              <div className="font-semibold mt-1">Priority booking</div>
              <button className="text-xs mt-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium">Upgrade</button>
            </div>
          </div>
        </aside>

        <main className="p-4 sm:p-8 max-w-6xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center mb-8">
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground">Good evening,</div>
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{user?.name ?? "Friend"} 👋</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="w-10 h-10 rounded-lg border border-border hover:bg-secondary transition grid place-items-center relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              </button>
              <img src={user?.avatar} className="w-10 h-10 rounded-lg bg-muted" alt="" />
            </div>
          </div>

          <div className="card-soft p-5 mb-6 bg-gradient-to-br from-primary/5 via-card to-card">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-card border border-border rounded-lg px-3">
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="What do you need fixed today?" className="bg-transparent outline-none py-2.5 w-full text-sm" />
              </div>
              <Link to="/search" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition">
                <Plus className="w-4 h-4" /> New request
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Jobs hired" value="14" delta="+3 this month" icon={Briefcase} accent="primary" />
            <StatCard label="Money spent" value="₹28,450" delta="₹4,200 saved vs market" icon={Wallet} accent="navy" />
            <StatCard label="Reviews given" value="11" delta="Avg 4.8★ given" icon={Star} accent="amber" />
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-lg">Recommended for you</h2>
                  <p className="text-xs text-muted-foreground">Based on your past hires and area</p>
                </div>
                <Link to="/search" className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:gap-1.5 transition-all">
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid gap-4">
                {loadingRec ? (
                  <div className="card-soft p-10 text-center"><Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" /></div>
                ) : recommended.length === 0 ? (
                  <div className="card-soft p-10 text-center text-sm text-muted-foreground">No recommendations yet — try searching for a worker.</div>
                ) : (
                  recommended.map((w, i) => (
                    <WorkerCard key={w.id} worker={w} rank={i + 1} />
                  ))
                )}
              </div>
            </section>

            <aside>
              <div className="card-soft p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Recent activity</h3>
                <ol className="relative border-l border-border ml-2 space-y-5">
                  {ACTIVITY.map((a, i) => (
                    <li key={i} className="pl-5 relative">
                      <span className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-card ${a.color === "primary" ? "bg-primary" : a.color === "amber" ? "bg-[color:var(--color-amber)]" : "bg-navy"}`} />
                      <p className="text-sm text-foreground leading-snug">{a.t}</p>
                      <span className="text-xs text-muted-foreground">{a.time}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, icon: Icon, accent }: { label: string; value: string; delta: string; icon: any; accent: "primary" | "navy" | "amber" }) {
  const bg = accent === "primary" ? "bg-primary/10 text-primary" : accent === "navy" ? "bg-navy/10 text-navy" : "bg-[color:var(--color-amber)]/15 text-[color:var(--color-amber)]";
  return (
    <div className="card-soft p-5 hover-lift">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
          <div className="text-2xl font-bold mt-2 tabular-nums">{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-lg grid place-items-center ${bg}`}><Icon className="w-4 h-4" /></div>
      </div>
      <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-primary" /> {delta}</div>
    </div>
  );
}