import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, MapPin, Star, Phone, MessageCircle, Calendar, Award, Briefcase, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { MLScoreRing } from "@/components/MLScoreRing";
import { WORKERS, REVIEWS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/worker/$id")({
  ssr: false,
  head: ({ params }) => {
    const w = WORKERS.find((x) => x.id === params.id);
    return {
      meta: [
        { title: `${w?.name ?? "Worker"} — Acquire·Your·Need` },
        { name: "description", content: w?.bio ?? "Worker profile" },
      ],
    };
  },
  component: WorkerProfile,
  notFoundComponent: () => <div className="p-12 text-center">Worker not found</div>,
});

const TABS = ["Overview", "Reviews", "Portfolio", "Contact"] as const;
type Tab = typeof TABS[number];

function WorkerProfile() {
  const { id } = Route.useParams();
  const worker = WORKERS.find((w) => w.id === id) ?? WORKERS[0];
  const [tab, setTab] = useState<Tab>("Overview");
  const { user } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (action: string) => {
    if (!user) {
      toast.error("Please sign in to continue", { description: `You need a user account to ${action}.` });
      navigate({ to: "/login", search: { redirect: `/worker/${worker.id}`, mode: "user" } as any });
      return false;
    }
    if (user.role === "admin") {
      toast.error("Switch to a user account to hire workers");
      return false;
    }
    return true;
  };

  const onHire = () => { if (requireAuth("hire a worker")) toast.success(`Hire request sent to ${worker.name}`, { description: "They'll respond within their average response time." }); };
  const onSchedule = () => { if (requireAuth("schedule a job")) toast.success("Opening scheduler…"); };
  const onReveal = () => { if (requireAuth("view contact details")) toast.success("Phone number revealed"); };
  const onChat = () => { if (requireAuth("start a chat")) toast.success("Opening chat…"); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Cover */}
      <div className="relative h-64 bg-navy overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 left-10 w-[400px] h-[400px] rounded-full opacity-40 blur-3xl animate-float-slow"
               style={{ background: "radial-gradient(circle, oklch(0.55 0.18 162) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 right-10 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-float-slower"
               style={{ background: "radial-gradient(circle, oklch(0.45 0.2 250) 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <Link to="/search" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back to search
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-20 relative z-10 grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Main */}
        <div>
          <div className="card-soft p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img src={worker.avatar} alt={worker.name} className="w-28 h-28 rounded-2xl bg-muted border-4 border-card shadow-elevated -mt-16" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{worker.name}</h1>
                  {worker.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                  {worker.available && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Available now
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1">{worker.skill} · {worker.experience} years experience</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber text-[color:var(--color-amber)]" /> {worker.rating} <span className="text-muted-foreground">({worker.reviewCount} reviews)</span></span>
                  <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-4 h-4" /> {worker.area}, {worker.city}</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><Briefcase className="w-4 h-4" /> {worker.jobsCompleted} jobs</span>
                </div>
              </div>
              <MLScoreRing score={worker.mlScore} size={80} stroke={7} />
            </div>

            {/* Tabs */}
            <div className="mt-8 border-b border-border flex gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative px-4 py-3 text-sm font-medium transition whitespace-nowrap ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                  {tab === t && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div key={tab} className="pt-6 animate-count-up">
              {tab === "Overview" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground leading-relaxed">{worker.bio}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {worker.subSkills.map((s) => (
                        <span key={s} className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> ML Score breakdown</h3>
                      <span className="text-2xl font-bold text-primary tabular-nums">{worker.mlScore}</span>
                    </div>
                    <div className="space-y-4">
                      {worker.scoreBreakdown.map((b, i) => (
                        <div key={b.label}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-foreground">{b.label}</span>
                            <span className="text-muted-foreground tabular-nums">{b.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--color-primary-glow)] animate-bar-grow"
                              style={{ width: `${b.value}%`, animationDelay: `${i * 0.08}s` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "Reviews" && (
                <div className="space-y-4">
                  {REVIEWS.map((r) => (
                    <div key={r.id} className="border border-border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${r.author}`} className="w-9 h-9 rounded-full bg-muted" alt="" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{r.author}</span>
                              {r.verified && (
                                <span className="inline-flex items-center gap-1 text-xs text-primary"><CheckCircle2 className="w-3 h-3" /> Verified hire</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{r.date}</div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber text-[color:var(--color-amber)]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === "Portfolio" && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-muted to-secondary flex items-center justify-center text-muted-foreground text-xs">
                      Project {i + 1}
                    </div>
                  ))}
                </div>
              )}

              {tab === "Contact" && (
                <div className="space-y-3 max-w-md">
                  <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /><span className="text-sm">+91 ••••• 4521</span></div>
                    <button onClick={onReveal} className="text-xs text-primary font-medium">Reveal</button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div className="flex items-center gap-3"><MessageCircle className="w-4 h-4 text-primary" /><span className="text-sm">In-app messaging</span></div>
                    <button onClick={onChat} className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium">Open chat</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky hire sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="card-soft p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold">₹{worker.pricePerHour}<span className="text-base text-muted-foreground font-normal">/hr</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">+ materials, transparent quote before hire</div>
              </div>
              <MLScoreRing score={worker.mlScore} size={48} stroke={4} />
            </div>
            <button onClick={onHire} className="mt-5 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 font-medium transition shadow-[0_8px_24px_-8px_rgba(29,158,117,0.6)] flex items-center justify-center gap-2">
              {!user && <Lock className="w-4 h-4" />} Hire now
            </button>
            <button onClick={onSchedule} className="mt-2 w-full border border-border text-foreground hover:bg-secondary rounded-lg py-3 font-medium transition flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule for later
            </button>
            <div className="mt-5 pt-5 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Response time</span><span className="font-medium">~18 min</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Completion rate</span><span className="font-medium">99%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cancellation</span><span className="font-medium">Free up to 1h</span></div>
            </div>
          </div>
          <div className="card-soft p-5 text-xs text-muted-foreground flex items-start gap-2">
            <BadgeCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p>Background verified · ID & address checked · Paid through Acquire·Your·Need escrow.</p>
          </div>
        </aside>
      </div>
      <div className="h-16" />
    </div>
  );
}
