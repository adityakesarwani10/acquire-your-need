import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search, MapPin, ArrowRight, Zap, Wrench, Hammer, PaintBucket, Snowflake,
  Sparkles, BookOpen, Car, ChefHat, Bug, Refrigerator, Shield, Brain,
  CheckCircle2, Star, Quote, Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useDetectedLocation } from "@/lib/use-location";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acquire·Your·Need — ML-powered skilled worker discovery" },
      { name: "description", content: "Find verified plumbers, electricians, carpenters & more. Ranked by ML, hired in minutes." },
    ],
  }),
  component: Landing,
});

const CATS = [
  { label: "Electrician", icon: Zap }, { label: "Plumber", icon: Wrench },
  { label: "Carpenter", icon: Hammer }, { label: "Painter", icon: PaintBucket },
  { label: "AC Tech", icon: Snowflake }, { label: "Cleaner", icon: Sparkles },
  { label: "Appliance", icon: Refrigerator }, { label: "Pest Control", icon: Bug },
  { label: "Home Tutor", icon: BookOpen }, { label: "Driver", icon: Car },
  { label: "Chef", icon: ChefHat },
];

function useCounter(target: number, duration = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const n = useCounter(value);
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-white tabular-nums">
        {n.toLocaleString()}<span className="text-primary">{suffix}</span>
      </div>
      <div className="text-sm text-white/60 mt-1">{label}</div>
    </div>
  );
}

function Landing() {
  const { location, detecting, setManual } = useDetectedLocation();
  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <div className="relative bg-navy overflow-hidden">
        <Navbar variant="dark" />
        {/* animated gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl animate-float-slow"
               style={{ background: "radial-gradient(circle, oklch(0.55 0.18 162) 0%, transparent 70%)" }} />
          <div className="absolute top-20 -right-40 w-[700px] h-[700px] rounded-full opacity-30 blur-3xl animate-float-slower"
               style={{ background: "radial-gradient(circle, oklch(0.45 0.2 250) 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.08]"
               style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-28 md:pt-24 md:pb-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-white/80 text-xs mb-6 animate-count-up">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              ML-ranked · Background verified · 2-hour response
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] animate-count-up" style={{ animationDelay: "0.05s" }}>
              Hire skilled workers <br />
              <span className="bg-gradient-to-r from-primary via-[color:var(--color-primary-glow)] to-emerald-300 bg-clip-text text-transparent">
                ranked by intelligence.
              </span>
            </h1>
            <p className="mt-5 text-lg text-white/60 max-w-xl mx-auto animate-count-up" style={{ animationDelay: "0.1s" }}>
              Our ML model evaluates 40+ signals to surface the right professional for your job — not just the cheapest or closest.
            </p>

            {/* Glass search */}
            <div className="mt-10 max-w-2xl mx-auto animate-count-up" style={{ animationDelay: "0.15s" }}>
              <div className="glass rounded-2xl p-2 flex items-center gap-1 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-4 h-4 text-white/60" />
                  <input
                    placeholder="What do you need? e.g. fix a leaking tap"
                    className="bg-transparent outline-none text-white placeholder:text-white/40 py-3 w-full text-sm"
                  />
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 border-l border-white/10">
                  {detecting ? <Loader2 className="w-4 h-4 text-white/60 animate-spin" /> : <MapPin className="w-4 h-4 text-primary" />}
                  <input
                    value={location.city}
                    onChange={(e) => setManual(e.target.value)}
                    placeholder="Detecting…"
                    className="bg-transparent outline-none text-white placeholder:text-white/40 py-3 w-36 text-sm"
                  />
                </div>
                <Link to="/search" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-xl text-sm font-medium transition">
                  Search <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs text-white/50">
                Popular:
                {["Leaking tap", "AC service", "Wardrobe install", "Wall painting"].map((t) => (
                  <Link key={t} to="/search" className="text-white/70 hover:text-white underline-offset-4 hover:underline">{t}</Link>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-10 border-t border-white/10">
              <Stat value={2400} suffix="+" label="Verified workers" />
              <Stat value={18000} suffix="+" label="Jobs completed" />
              <Stat value={48} suffix="★" label="Avg rating ×10" />
            </div>
          </div>
        </div>

        {/* Category scroller */}
        <div className="relative pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATS.map(({ label, icon: Icon }) => (
                <Link
                  key={label}
                  to="/search"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass text-white/90 hover:bg-white/15 transition hover:-translate-y-0.5 duration-200"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">How it works</div>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">From search to hire in minutes</h2>
        </div>
        <div className="relative grid md:grid-cols-3 gap-8">
          <svg className="hidden md:block absolute top-10 left-[16%] right-[16%] w-auto h-2 -z-0" viewBox="0 0 800 8" preserveAspectRatio="none">
            <path d="M0,4 Q200,-4 400,4 T800,4" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="6 6" fill="none" className="animate-draw-line" style={{ strokeDasharray: 1000 }} />
          </svg>
          {[
            { n: "01", title: "Describe the job", text: "Tell us what needs fixing. One sentence is enough.", icon: Search },
            { n: "02", title: "ML ranks workers", text: "We score every available worker on 40+ signals.", icon: Brain },
            { n: "03", title: "Hire & track", text: "Pick your top match. Track the job to completion.", icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.n} className="card-soft p-7 relative z-10 hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[color:var(--color-primary-glow)] flex items-center justify-center text-white shadow-elevated">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-3xl font-bold text-muted-foreground/30 tabular-nums">{s.n}</span>
              </div>
              <h3 className="mt-5 font-semibold text-lg">{s.title}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ML SCORE EXPLAINER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-3xl bg-navy text-navy-foreground p-8 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]"
               style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest">
                <Brain className="w-3.5 h-3.5" /> The ML Score
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">
                One number. <br /> Forty-plus signals.
              </h2>
              <p className="text-white/60 mt-4 leading-relaxed">
                We learn from every completed job — response time, repeat hires, dispute outcomes, verified credentials, regional demand — to predict who will deliver the best outcome for <em>your</em> job.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-white/80">
                {["Updated after every job", "Bias-audited monthly", "Transparent breakdown on each profile"].map((t) => (
                  <li key={t} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="font-medium">ML Score breakdown</div>
                <div className="text-3xl font-bold text-primary tabular-nums">96</div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Customer satisfaction", v: 98 },
                  { label: "Job completion rate", v: 99 },
                  { label: "Response time", v: 92 },
                  { label: "Verified credentials", v: 100 },
                  { label: "Repeat hire rate", v: 88 },
                ].map((b, i) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs text-white/70 mb-1.5">
                      <span>{b.label}</span><span className="tabular-nums">{b.v}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--color-primary-glow)] animate-bar-grow"
                           style={{ width: `${b.v}%`, animationDelay: `${i * 0.1}s` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Loved by 18k+ customers</div>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">Real jobs. Real reviews.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Aakash M.", role: "Homeowner", text: "The ML score actually works. The #1 ranked electrician fixed a wiring issue 3 others couldn't diagnose.", rating: 5 },
            { name: "Neha P.", role: "Property manager", text: "I manage 12 flats. Acquire·Your·Need is the only platform where I trust the rankings.", rating: 5 },
            { name: "Kunal D.", role: "First-time hire", text: "Booked a plumber at 9 PM. He arrived by 10. The price was exactly what was quoted.", rating: 5 },
          ].map((t) => (
            <div key={t.name} className="card-soft p-6 hover-lift relative">
              <Quote className="absolute top-5 right-5 w-6 h-6 text-primary/20" />
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber text-[color:var(--color-amber)]" />
                ))}
              </div>
              <p className="mt-4 text-foreground leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
                <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${t.name}`} className="w-10 h-10 rounded-full bg-muted" alt="" />
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-primary via-[color:var(--color-primary-glow)] to-emerald-400 p-10 md:p-16 relative overflow-hidden text-center">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
          <div className="relative">
            <Shield className="w-10 h-10 mx-auto text-white" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-5 max-w-2xl mx-auto leading-tight">
              The right worker for the job. Every time.
            </h2>
            <p className="text-white/80 mt-4 max-w-lg mx-auto">Join 18,000+ customers who don't gamble on hires.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/search" className="px-6 py-3 rounded-lg bg-navy text-white font-medium hover:bg-navy/90 transition shadow-xl">
                Find a worker
              </Link>
              <Link to="/signup" className="px-6 py-3 rounded-lg bg-white text-navy font-medium hover:bg-white/90 transition">
                Become a pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>© 2026 Acquire·Your·Need</span>
          </div>
          <div className="flex gap-6">
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
