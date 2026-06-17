import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield, Users, Briefcase, TrendingUp, DollarSign, AlertTriangle,
  Search as SearchIcon, CheckCircle2, XCircle, MoreHorizontal, LogOut, Sparkles,
  LayoutDashboard, UserCheck, MessageSquare, Settings,
} from "lucide-react";
import { RequireAuth, useAuth } from "@/lib/auth";
import { WORKERS, CATEGORIES } from "@/lib/mock-data";
import { MLScoreRing } from "@/components/MLScoreRing";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Acquire·Your·Need" }] }),
  component: () => (
    <RequireAuth role="admin">
      <AdminDashboard />
    </RequireAuth>
  ),
});

const NAV = [
  { label: "Overview", icon: LayoutDashboard, key: "overview" },
  { label: "Workers", icon: UserCheck, key: "workers" },
  { label: "Users & hires", icon: Users, key: "users" },
  { label: "Disputes", icon: MessageSquare, key: "disputes" },
  { label: "Settings", icon: Settings, key: "settings" },
] as const;

type TabKey = (typeof NAV)[number]["key"];

const PENDING = [
  { id: "p1", name: "Rohit Sharma", skill: "Electrician", city: "Bengaluru", applied: "2h ago", docs: "ID, License" },
  { id: "p2", name: "Lakshmi Iyer", skill: "Cleaner", city: "Bengaluru", applied: "5h ago", docs: "ID, Address" },
  { id: "p3", name: "Imran Khan", skill: "Plumber", city: "Mumbai", applied: "1d ago", docs: "ID, License, Address" },
  { id: "p4", name: "Sneha Das", skill: "Painter", city: "Bengaluru", applied: "2d ago", docs: "ID" },
];

const HIRES = [
  { id: "h1", user: "Aakash M.", worker: "Ravi Kumar", skill: "Electrician", amount: 1800, status: "completed" },
  { id: "h2", user: "Neha P.", worker: "Priya Sharma", skill: "Plumber", amount: 950, status: "in_progress" },
  { id: "h3", user: "Kunal D.", worker: "Mohammed Faiz", skill: "Carpenter", amount: 4200, status: "completed" },
  { id: "h4", user: "Sara K.", worker: "Anjali Reddy", skill: "Painter", amount: 2400, status: "scheduled" },
  { id: "h5", user: "Vikram J.", worker: "Suresh Patil", skill: "AC Tech", amount: 1600, status: "cancelled" },
];

const DISPUTES = [
  { id: "d1", user: "Vikram J.", worker: "Suresh Patil", reason: "Job cancelled without notice", severity: "high", age: "3h" },
  { id: "d2", user: "Priya N.", worker: "Deepak Verma", reason: "Quality concerns on drain work", severity: "medium", age: "1d" },
];

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<TabKey>("overview");
  const [q, setQ] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-0 lg:h-screen border-r border-border bg-navy text-white flex lg:flex-col">
          <div className="p-6 hidden lg:block">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight">Acquire·Your·Need</div>
                <div className="text-[10px] uppercase tracking-widest text-primary mt-0.5 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin
                </div>
              </div>
            </Link>
          </div>
          <nav className="flex lg:flex-col gap-1 px-3 py-3 lg:py-0 flex-1 overflow-x-auto">
            {NAV.map((n) => (
              <button key={n.key} onClick={() => setTab(n.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition whitespace-nowrap ${
                  tab === n.key ? "bg-white/10 text-white font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}>
                <n.icon className="w-4 h-4" /> <span className="hidden sm:inline">{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="hidden lg:block p-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <img src={user?.avatar} alt="" className="w-8 h-8 rounded-lg bg-white/10" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user?.name}</div>
                <div className="text-xs text-white/50 truncate">{user?.email}</div>
              </div>
            </div>
            <button onClick={logout} className="w-full text-xs flex items-center gap-2 text-white/70 hover:text-white px-2 py-1.5 rounded-md hover:bg-white/5">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="p-4 sm:p-8 max-w-7xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center mb-8">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold">Admin console</div>
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{NAV.find((n) => n.key === tab)?.label}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3 card-soft py-1">
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="bg-transparent outline-none py-1.5 w-44 text-sm" />
              </div>
            </div>
          </div>

          {tab === "overview" && <Overview />}
          {tab === "workers" && <WorkersTab q={q} />}
          {tab === "users" && <UsersTab q={q} />}
          {tab === "disputes" && <DisputesTab />}
          {tab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, icon: Icon, accent }: { label: string; value: string; delta: string; icon: any; accent: "primary" | "navy" | "amber" | "red" }) {
  const bg =
    accent === "primary" ? "bg-primary/10 text-primary"
    : accent === "navy" ? "bg-navy/10 text-navy"
    : accent === "red" ? "bg-red-500/10 text-red-500"
    : "bg-[color:var(--color-amber)]/15 text-[color:var(--color-amber)]";
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

function Overview() {
  const buckets = [
    { label: "90+", count: WORKERS.filter((w) => w.mlScore >= 90).length, color: "bg-primary" },
    { label: "75-89", count: WORKERS.filter((w) => w.mlScore >= 75 && w.mlScore < 90).length, color: "bg-[color:var(--color-amber)]" },
    { label: "<75", count: WORKERS.filter((w) => w.mlScore < 75).length, color: "bg-muted-foreground" },
  ];
  const totalRev = HIRES.filter((h) => h.status === "completed").reduce((s, h) => s + h.amount, 0);

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Workers" value="2,418" delta="+24 this week" icon={UserCheck} accent="primary" />
        <StatCard label="Active users" value="14,820" delta="+312 this week" icon={Users} accent="navy" />
        <StatCard label="Revenue (₹)" value={totalRev.toLocaleString()} delta="+18.4% MoM" icon={DollarSign} accent="amber" />
        <StatCard label="Open disputes" value={String(DISPUTES.length)} delta="2 unresolved" icon={AlertTriangle} accent="red" />
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <section className="card-soft p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Top categories</h3>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>
          <div className="space-y-4">
            {CATEGORIES.slice(0, 6).map((c, i) => {
              const v = [92, 78, 65, 54, 41, 33][i];
              return (
                <div key={c.key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted-foreground tabular-nums">{v * 12} jobs</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--color-primary-glow)] animate-bar-grow"
                         style={{ width: `${v}%`, animationDelay: `${i * 0.08}s` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card-soft p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">ML score distribution</h3>
          </div>
          <div className="space-y-3">
            {buckets.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{b.label}</span>
                  <span className="text-muted-foreground tabular-nums">{b.count} workers</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${b.color}`} style={{ width: `${(b.count / WORKERS.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-border text-xs text-muted-foreground">
            Total active workers: <span className="font-semibold text-foreground tabular-nums">{WORKERS.length}</span>
          </div>
        </section>
      </div>

      <section className="card-soft p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">Pending worker approvals</h3>
          <span className="text-xs text-muted-foreground">{PENDING.length} awaiting review</span>
        </div>
        <PendingTable />
      </section>
    </div>
  );
}

function PendingTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground uppercase tracking-wider">
          <tr className="border-b border-border">
            <th className="text-left font-semibold py-3">Applicant</th>
            <th className="text-left font-semibold py-3">Skill</th>
            <th className="text-left font-semibold py-3 hidden md:table-cell">City</th>
            <th className="text-left font-semibold py-3 hidden md:table-cell">Docs</th>
            <th className="text-left font-semibold py-3">Applied</th>
            <th className="text-right font-semibold py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {PENDING.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${p.name}`} alt="" className="w-9 h-9 rounded-lg bg-muted" />
                  <div className="font-medium">{p.name}</div>
                </div>
              </td>
              <td className="py-3 text-muted-foreground">{p.skill}</td>
              <td className="py-3 text-muted-foreground hidden md:table-cell">{p.city}</td>
              <td className="py-3 text-muted-foreground hidden md:table-cell">{p.docs}</td>
              <td className="py-3 text-muted-foreground">{p.applied}</td>
              <td className="py-3">
                <div className="flex items-center gap-2 justify-end">
                  <button className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-secondary transition">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkersTab({ q }: { q: string }) {
  const filtered = WORKERS.filter((w) =>
    !q || `${w.name} ${w.skill} ${w.city}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <div className="card-soft p-6">
        <h3 className="font-semibold mb-4">Pending approvals ({PENDING.length})</h3>
        <PendingTable />
      </div>
      <div className="card-soft p-6">
        <h3 className="font-semibold mb-4">All workers ({filtered.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase tracking-wider">
              <tr className="border-b border-border">
                <th className="text-left font-semibold py-3">Worker</th>
                <th className="text-left font-semibold py-3">Skill</th>
                <th className="text-left font-semibold py-3 hidden md:table-cell">Jobs</th>
                <th className="text-left font-semibold py-3">ML</th>
                <th className="text-left font-semibold py-3">Status</th>
                <th className="text-right font-semibold py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={w.avatar} alt="" className="w-9 h-9 rounded-lg bg-muted" />
                      <div>
                        <div className="font-medium">{w.name}</div>
                        <div className="text-xs text-muted-foreground">{w.city} · {w.area}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{w.skill}</td>
                  <td className="py-3 text-muted-foreground tabular-nums hidden md:table-cell">{w.jobsCompleted}</td>
                  <td className="py-3"><MLScoreRing score={w.mlScore} size={36} stroke={3} /></td>
                  <td className="py-3">
                    {w.verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Verified</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[color:var(--color-amber)]/15 text-[color:var(--color-amber)] text-xs font-medium">Unverified</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-secondary transition inline-flex items-center gap-1">
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ q }: { q: string }) {
  const list = HIRES.filter((h) => !q || `${h.user} ${h.worker} ${h.skill}`.toLowerCase().includes(q.toLowerCase()));
  const badge = (s: string) => {
    const map: Record<string, string> = {
      completed: "bg-primary/10 text-primary",
      in_progress: "bg-[color:var(--color-amber)]/15 text-[color:var(--color-amber)]",
      scheduled: "bg-navy/10 text-navy",
      cancelled: "bg-red-500/10 text-red-500",
    };
    return map[s] ?? "bg-muted text-muted-foreground";
  };
  return (
    <div className="card-soft p-6">
      <h3 className="font-semibold mb-4">All hires ({list.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase tracking-wider">
            <tr className="border-b border-border">
              <th className="text-left font-semibold py-3">User</th>
              <th className="text-left font-semibold py-3">Worker</th>
              <th className="text-left font-semibold py-3 hidden md:table-cell">Skill</th>
              <th className="text-left font-semibold py-3">Amount</th>
              <th className="text-left font-semibold py-3">Status</th>
              <th className="text-right font-semibold py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((h) => (
              <tr key={h.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition">
                <td className="py-3 font-medium">{h.user}</td>
                <td className="py-3 text-muted-foreground">{h.worker}</td>
                <td className="py-3 text-muted-foreground hidden md:table-cell">{h.skill}</td>
                <td className="py-3 tabular-nums">₹{h.amount.toLocaleString()}</td>
                <td className="py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge(h.status)}`}>
                    {h.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3 text-right"><MoreHorizontal className="w-4 h-4 text-muted-foreground ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DisputesTab() {
  return (
    <div className="space-y-4">
      {DISPUTES.map((d) => (
        <div key={d.id} className="card-soft p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${
            d.severity === "high" ? "bg-red-500/10 text-red-500" : "bg-[color:var(--color-amber)]/15 text-[color:var(--color-amber)]"
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium">{d.reason}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{d.user} vs {d.worker} · opened {d.age} ago</div>
          </div>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition">Resolve</button>
            <button className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition">View thread</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="card-soft p-6 max-w-xl">
      <h3 className="font-semibold mb-1">Platform settings</h3>
      <p className="text-sm text-muted-foreground mb-5">Configure platform-wide behavior.</p>
      <div className="space-y-4">
        {[
          { label: "Auto-approve verified workers", desc: "Skip manual review if ID + license check passes." },
          { label: "ML re-ranking", desc: "Update rankings after every completed job." },
          { label: "Escrow holds", desc: "Hold payment until job marked complete by user." },
        ].map((s, i) => (
          <label key={s.label} className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
            <Toggle defaultOn={i !== 0} />
          </label>
        ))}
      </div>
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`relative w-10 h-6 rounded-full transition shrink-0 ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}
