import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Briefcase, Wallet, Star, Settings,
  Sparkles, TrendingUp, Bell, CheckCircle2, Clock,
  MapPin, Phone, Mail, ChevronRight, ArrowUpRight,
  ToggleLeft, ToggleRight, User, Shield, LogOut,
  AlertCircle, ThumbsUp, XCircle, IndianRupee, Loader2,
} from "lucide-react";
import { MLScoreRing } from "@/components/MLScoreRing";
import { useAuth } from "@/lib/auth";
import {
  apiGetMyJobRequests, apiUpdateJobRequest, apiGetMyEarnings, apiGetWorker,
  type RawJobRequest, type RawEarning, ApiError,
} from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────
type TabId = "overview" | "requests" | "earnings" | "reviews" | "profile" | "settings";

type JobRequest = {
  id: string; user: string; avatar: string; task: string;
  location: string; date: string; budget: number; status: "pending" | "accepted" | "declined";
};

type EarningRow = {
  id: string; user: string; task: string; date: string; amount: number; status: "paid" | "pending";
};

type Review = {
  id: string; user: string; avatar: string; rating: number;
  comment: string; date: string; task: string;
};

function fromRawRequest(r: RawJobRequest): JobRequest {
  return {
    id: r._id, user: r.user, avatar: r.user.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
    task: r.task, location: r.location, budget: r.budget, status: r.status,
    date: new Date(r.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }),
  };
}
function fromRawEarning(e: RawEarning): EarningRow {
  return {
    id: e._id, user: e.user, task: e.task, amount: e.amount, status: e.status,
    date: e.status === "paid" && e.paidAt ? new Date(e.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Pending",
  };
}

// ── Sidebar nav config ─────────────────────────────────────────────────────
const NAV: { id: TabId; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "overview",  label: "Overview",      icon: LayoutDashboard },
  { id: "requests",  label: "Job Requests",  icon: Briefcase },
  { id: "earnings",  label: "Earnings",      icon: Wallet },
  { id: "reviews",   label: "Reviews",       icon: Star },
  { id: "profile",   label: "My Profile",    icon: User },
  { id: "settings",  label: "Settings",      icon: Settings },
];

// ── Main component ──────────────────────────────────────────────────────────
export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("overview");
  const [available, setAvailable] = useState(user?.available ?? true);
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { document.title = "Worker Dashboard — Acquire·Your·Need"; }, []);

  // Load job requests, earnings, and this worker's own reviews from the real backend
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiGetMyJobRequests(),
      apiGetMyEarnings(),
      apiGetWorker(user._id),
    ])
      .then(([reqRes, earnRes, workerRes]) => {
        setRequests(reqRes.requests.map(fromRawRequest));
        setEarnings(earnRes.earnings.map(fromRawEarning));
        setReviews(
          workerRes.reviews.map((r) => ({
            id: r._id, user: r.author, avatar: r.author.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
            rating: r.rating, comment: r.text, task: r.task,
            date: new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          }))
        );
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load your dashboard data."))
      .finally(() => setLoading(false));
  }, [user]);

  const acceptRequest = async (id: string) => {
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status: "accepted" } : x)));
    try {
      await apiUpdateJobRequest(id, "accepted");
      // Accepting creates a pending earning on the backend — refresh earnings to reflect it
      const earnRes = await apiGetMyEarnings();
      setEarnings(earnRes.earnings.map(fromRawEarning));
    } catch {
      setRequests((r) => r.map((x) => (x.id === id ? { ...x, status: "pending" } : x))); // revert on failure
    }
  };
  const declineRequest = async (id: string) => {
    setRequests((r) => r.map((x) => (x.id === id ? { ...x, status: "declined" } : x)));
    try {
      await apiUpdateJobRequest(id, "declined");
    } catch {
      setRequests((r) => r.map((x) => (x.id === id ? { ...x, status: "pending" } : x)));
    }
  };

  const pendingCount  = requests.filter(r => r.status === "pending").length;
  const paidTotal     = earnings.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const pendingPayout = earnings.filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const avgRating     = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : (user?.rating ?? 0).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-0 lg:h-screen border-r border-border bg-card flex flex-col">
          {/* Logo */}
          <div className="p-5 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">Acquire·Your·Need</span>
            </Link>
          </div>

          {/* Worker identity card */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() ?? "RK"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{user?.name ?? "Ravi Kumar"}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.skill ?? "Electrician"}</div>
              </div>
              {user?.verified && (
                <Shield className="w-4 h-4 text-primary ml-auto shrink-0" />
              )}
            </div>
            {/* Availability toggle */}
            <button
              onClick={() => setAvailable(a => !a)}
              className={`mt-3 w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
            >
              <span>{available ? "🟢 Available for work" : "🔴 Unavailable"}</span>
              {available
                ? <ToggleRight className="w-5 h-5" />
                : <ToggleLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Nav links — all clickable */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition text-left ${
                  tab === id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {id === "requests" && pendingCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {pendingCount}
                  </span>
                )}
                {tab === id && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </button>
            ))}
          </nav>

          {/* Sign out */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="p-4 sm:p-8 max-w-5xl w-full">

          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-sm text-muted-foreground">Worker Portal</div>
              <h1 className="text-2xl sm:text-3xl font-bold">{NAV.find(n => n.id === tab)?.label}</h1>
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <button className="w-10 h-10 rounded-lg border border-border hover:bg-secondary transition grid place-items-center relative" onClick={() => setTab("requests")}>
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                </button>
              )}
              <img
                src={user?.avatar ?? `https://api.dicebear.com/9.x/notionists/svg?seed=worker`}
                className="w-10 h-10 rounded-lg bg-muted" alt=""
              />
            </div>
          </div>

          {/* Loading / error guard for the data-driven tabs */}
          {loading ? (
            <div className="card-soft p-16 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
            </div>
          ) : error ? (
            <div className="card-soft p-16 text-center">
              <AlertCircle className="w-7 h-7 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Couldn't load your data</h3>
              <p className="text-muted-foreground text-sm mt-1">{error}</p>
            </div>
          ) : (
          <>
          {/* ── TAB: Overview ─────────────────────────────────────────── */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Total earned" value={`₹${paidTotal.toLocaleString("en-IN")}`} delta="This month" icon={IndianRupee} accent="primary" onClick={() => setTab("earnings")} />
                <StatCard label="Pending payout" value={`₹${pendingPayout.toLocaleString("en-IN")}`} delta={`${requests.filter(r=>r.status==="pending").length} active jobs`} icon={Clock} accent="amber" onClick={() => setTab("requests")} />
                <StatCard label="Jobs completed" value={`${user?.jobsCompleted ?? 612}`} delta="+8 this month" icon={CheckCircle2} accent="primary" onClick={() => setTab("earnings")} />
                <StatCard label="Avg. rating" value={`${avgRating} ★`} delta={`${reviews.length} reviews`} icon={Star} accent="amber" onClick={() => setTab("reviews")} />
              </div>

              {/* ML Score + pending requests */}
              <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Pending Requests</h2>
                    <button onClick={() => setTab("requests")} className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:gap-1.5 transition-all">
                      View all <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {requests.filter(r => r.status === "pending").slice(0, 2).map(r => (
                    <RequestCard key={r.id} req={r} onAccept={acceptRequest} onDecline={declineRequest} compact />
                  ))}
                  {requests.filter(r => r.status === "pending").length === 0 && (
                    <div className="card-soft p-8 text-center text-muted-foreground text-sm">No pending requests 🎉</div>
                  )}
                </section>

                <aside className="space-y-4">
                  {/* ML Score card */}
                  <div className="card-soft p-5">
                    <h3 className="font-semibold mb-4">Your ML Score</h3>
                    <div className="flex items-center gap-4 mb-5">
                      <MLScoreRing score={user?.mlScore ?? 96} size={80} />
                      <div>
                        <div className="text-2xl font-bold">{user?.mlScore ?? 96}</div>
                        <div className="text-xs text-muted-foreground">out of 100</div>
                        <div className="text-xs text-primary font-medium mt-1">Top 5% on platform</div>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { label: "Rating",        val: Math.round(((user?.rating ?? 4.9) / 5) * 100) },
                        { label: "Experience",    val: Math.min(100, (user?.experience ?? 9) * 6) },
                        { label: "Jobs done",     val: Math.min(100, Math.round((user?.jobsCompleted ?? 612) / 8)) },
                        { label: "Response rate", val: 94 },
                        { label: "Availability",  val: available ? 100 : 20 },
                      ].map(({ label, val }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium">{val}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent review */}
                  <div className="card-soft p-5">
                    <h3 className="font-semibold mb-3">Latest Review</h3>
                    {reviews.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No reviews yet.</p>
                    ) : (
                      <>
                        <div className="text-xs text-muted-foreground mb-1">{reviews[0].user} · {reviews[0].date}</div>
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < reviews[0].rating ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                          ))}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">"{reviews[0].comment}"</p>
                      </>
                    )}
                    <button onClick={() => setTab("reviews")} className="text-xs text-primary mt-3 font-medium hover:underline">See all reviews →</button>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* ── TAB: Job Requests ─────────────────────────────────────── */}
          {tab === "requests" && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "accepted", "declined"] as const).map((f) => {
                  const count = f === "all" ? requests.length : requests.filter(r => r.status === f).length;
                  return (
                    <FilterChip key={f} label={`${f.charAt(0).toUpperCase() + f.slice(1)} (${count})`} active={false} />
                  );
                })}
              </div>
              {requests.length === 0 && (
                <div className="card-soft p-12 text-center text-muted-foreground">No job requests yet.</div>
              )}
              {requests.map(r => (
                <RequestCard key={r.id} req={r} onAccept={acceptRequest} onDecline={declineRequest} />
              ))}
            </div>
          )}

          {/* ── TAB: Earnings ─────────────────────────────────────────── */}
          {tab === "earnings" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <EarnStat label="Total earned" value={`₹${paidTotal.toLocaleString("en-IN")}`} sub="All time" color="primary" />
                <EarnStat label="Pending payout" value={`₹${pendingPayout.toLocaleString("en-IN")}`} sub={`${requests.filter(r => r.status === "pending").length} active jobs`} color="amber" />
                <EarnStat label="Avg. per job" value={`₹${earnings.length ? Math.round(paidTotal / earnings.filter(e => e.status === "paid").length || 1).toLocaleString("en-IN") : 0}`} sub="Based on paid jobs" color="primary" />
              </div>
              <div className="card-soft overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold">Transaction History</h3>
                  <span className="text-xs text-muted-foreground">{earnings.length} transactions</span>
                </div>
                <div className="divide-y divide-border">
                  {earnings.map(e => (
                    <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/40 transition">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {e.user.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{e.task}</div>
                        <div className="text-xs text-muted-foreground">{e.user} · {e.date}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-semibold ${e.status === "paid" ? "text-primary" : "text-amber-500"}`}>
                          {e.status === "paid" ? "+" : ""}₹{e.amount.toLocaleString("en-IN")}
                        </div>
                        <div className={`text-xs font-medium ${e.status === "paid" ? "text-primary" : "text-amber-500"}`}>
                          {e.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Reviews ──────────────────────────────────────────── */}
          {tab === "reviews" && (
            <div className="space-y-4">
              <div className="card-soft p-5 flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">{avgRating}</div>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(+avgRating) ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(n => {
                    const cnt = reviews.filter(r => r.rating === n).length;
                    const pct = reviews.length ? Math.round((cnt / reviews.length) * 100) : 0;
                    return (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-right text-muted-foreground">{n}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-muted-foreground">{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {reviews.map(r => (
                <div key={r.id} className="card-soft p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">{r.avatar}</div>
                      <div>
                        <div className="text-sm font-semibold">{r.user}</div>
                        <div className="text-xs text-muted-foreground">{r.task} · {r.date}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">"{r.comment}"</p>
                  <button className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition">
                    <ThumbsUp className="w-3.5 h-3.5" /> Thank this customer
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB: My Profile ───────────────────────────────────────── */}
          {tab === "profile" && (
            <div className="space-y-5">
              <div className="card-soft p-6">
                <div className="flex items-start gap-5 flex-wrap">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center flex-shrink-0">
                    {user?.name?.slice(0,2).toUpperCase() ?? "RK"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold">{user?.name ?? "Ravi Kumar"}</h2>
                      {user?.verified && <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="w-3 h-3" /> Verified</span>}
                    </div>
                    <div className="text-muted-foreground text-sm mt-1">{user?.skill ?? "Electrician"} · {user?.area ?? "Indiranagar"}, {user?.city ?? "Bengaluru"}</div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user?.area ?? "Indiranagar"}, {user?.city ?? "Bengaluru"}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {user?.experience ?? 9} yrs experience</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> {user?.jobsCompleted ?? 612} jobs done</span>
                    </div>
                  </div>
                  <MLScoreRing score={user?.mlScore ?? 96} size={64} />
                </div>
              </div>

              <div className="card-soft p-6 space-y-4">
                <h3 className="font-semibold">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(user?.subSkills ?? ["Wiring", "Panel install", "Smart home", "Inverter"]).map(s => (
                    <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{s}</span>
                  ))}
                </div>
              </div>

              <div className="card-soft p-6 space-y-3">
                <h3 className="font-semibold">Contact Info</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" /> {user?.email ?? "worker@ayn.com"}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" /> +91 98765 43210
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <IndianRupee className="w-4 h-4" /> ₹{user?.pricePerHour ?? 450} / hour
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Settings ─────────────────────────────────────────── */}
          {tab === "settings" && (
            <div className="space-y-5 max-w-xl">
              <div className="card-soft p-6 space-y-4">
                <h3 className="font-semibold">Availability</h3>
                <button
                  onClick={() => setAvailable(a => !a)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition ${available ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                >
                  <span className="text-sm font-medium">{available ? "🟢 Currently available for jobs" : "🔴 Currently unavailable"}</span>
                  {available ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <p className="text-xs text-muted-foreground">When unavailable, you won't appear in search results and won't receive new job requests.</p>
              </div>

              <div className="card-soft p-6 space-y-4">
                <h3 className="font-semibold">Pricing</h3>
                <div>
                  <label className="text-sm font-medium">Hourly rate (₹)</label>
                  <input type="number" defaultValue={user?.pricePerHour ?? 450} min={100} max={5000}
                    className="mt-2 w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition" />
                </div>
                <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">Save changes</button>
              </div>

              <div className="card-soft p-6 space-y-3">
                <h3 className="font-semibold text-red-500">Danger zone</h3>
                <p className="text-sm text-muted-foreground">Once you delete your account, all profile data is permanently removed.</p>
                <button className="px-5 py-2 border border-red-300 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition">Delete my account</button>
              </div>
            </div>
          )}
          </>
          )}

        </main>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function StatCard({ label, value, delta, icon: Icon, accent, onClick }: {
  label: string; value: string; delta: string; icon: any; accent: "primary" | "amber"; onClick?: () => void;
}) {
  const cls = accent === "primary" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-600";
  return (
    <div className="card-soft p-5 hover-lift cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
          <div className="text-2xl font-bold mt-2 tabular-nums">{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-lg grid place-items-center ${cls}`}><Icon className="w-4 h-4" /></div>
      </div>
      <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-primary" /> {delta}</div>
    </div>
  );
}

function RequestCard({ req, onAccept, onDecline, compact }: {
  req: JobRequest; onAccept: (id: string) => void; onDecline: (id: string) => void; compact?: boolean;
}) {
  const statusStyle = {
    pending:  "bg-amber-50 text-amber-600 border-amber-200",
    accepted: "bg-primary/10 text-primary border-primary/20",
    declined: "bg-red-50 text-red-500 border-red-200",
  }[req.status];

  const statusIcon = {
    pending:  <AlertCircle className="w-3.5 h-3.5" />,
    accepted: <CheckCircle2 className="w-3.5 h-3.5" />,
    declined: <XCircle className="w-3.5 h-3.5" />,
  }[req.status];

  return (
    <div className="card-soft p-5 hover:border-primary/30 transition">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
          {req.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold">{req.user}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyle}`}>
              {statusIcon} {req.status}
            </span>
          </div>
          <p className="text-sm text-foreground font-medium">{req.task}</p>
          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.location}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {req.date}</span>
            <span className="flex items-center gap-1 text-primary font-semibold"><IndianRupee className="w-3 h-3" /> ₹{req.budget.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
      {req.status === "pending" && !compact && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <button onClick={() => onAccept(req.id)}
            className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Accept
          </button>
          <button onClick={() => onDecline(req.id)}
            className="flex-1 py-2 border border-border text-sm font-medium rounded-lg hover:bg-secondary text-muted-foreground transition flex items-center justify-center gap-1.5">
            <XCircle className="w-4 h-4" /> Decline
          </button>
        </div>
      )}
    </div>
  );
}

function EarnStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: "primary" | "amber" }) {
  return (
    <div className="card-soft p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={`text-2xl font-bold mt-2 ${color === "primary" ? "text-primary" : "text-amber-500"}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function FilterChip({ label, active }: { label: string; active: boolean }) {
  return (
    <button className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
      {label}
    </button>
  );
}