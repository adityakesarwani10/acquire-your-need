import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, Star, Inbox, Loader2, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { WorkerCard } from "@/components/WorkerCard";
import { CATEGORIES } from "@/lib/mock-data";
import { apiSearchWorkers, workerFromRaw, ApiError } from "@/lib/api";
import type { Worker } from "@/lib/mock-data";

type Sort = "ml" | "rating" | "experience" | "price";

export default function SearchPage() {
  useEffect(() => { document.title = "Search workers — Acquire·Your·Need"; }, []);
  const [params] = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [location, setLocation] = useState(params.get("location") ?? "Bengaluru");
  const [skill, setSkill] = useState<string>(params.get("skill") ?? "all");
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [availOnly, setAvailOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("ml");

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounced fetch whenever query/skill/location changes
  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      apiSearchWorkers({ q, skill, location })
        .then((res) => setWorkers(res.workers.map(workerFromRaw)))
        .catch((e) => {
          setError(e instanceof ApiError ? e.message : "Couldn't reach the server. Is the backend running?");
          setWorkers([]);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [q, skill, location]);

  // Client-side filters (rating/price/availability) + sort applied on top of the server-ranked result
  const filtered = useMemo(() => {
    let r = workers.filter((w) => {
      if (w.rating < minRating) return false;
      if (w.pricePerHour > maxPrice) return false;
      if (availOnly && !w.available) return false;
      return true;
    });
    r = [...r].sort((a, b) => {
      if (sort === "ml") return b.mlScore - a.mlScore;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "experience") return b.experience - a.experience;
      return a.pricePerHour - b.pricePerHour;
    });
    return r;
  }, [workers, minRating, maxPrice, availOnly, sort]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="sticky top-16 z-30 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 card-soft py-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by skill or name…" className="bg-transparent outline-none py-2 w-full text-sm" />
          </div>
          <div className="flex items-center gap-2 px-3 card-soft py-1 md:w-56">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="bg-transparent outline-none py-2 w-full text-sm" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="card-soft px-3 py-2.5 text-sm md:w-52 cursor-pointer">
            <option value="ml">Sort: ML Score</option>
            <option value="rating">Sort: Rating</option>
            <option value="experience">Sort: Experience</option>
            <option value="price">Sort: Price (low → high)</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="card-soft p-5 h-fit lg:sticky lg:top-44">
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Filters</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Skill</div>
              <div className="flex flex-wrap gap-1.5">
                <Chip active={skill === "all"} onClick={() => setSkill("all")}>All</Chip>
                {CATEGORIES.slice(0, 6).map((c) => (
                  <Chip key={c.key} active={skill === c.label.toLowerCase()} onClick={() => setSkill(c.label.toLowerCase())}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                <span>Min rating</span><span className="flex items-center gap-1 text-foreground"><Star className="w-3 h-3 fill-amber text-[color:var(--color-amber)]" />{minRating.toFixed(1)}</span>
              </div>
              <input type="range" min={0} max={5} step={0.1} value={minRating} onChange={(e) => setMinRating(+e.target.value)} className="w-full accent-[color:var(--color-primary)]" />
            </div>

            <div>
              <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                <span>Max price/hr</span><span className="text-foreground">₹{maxPrice}</span>
              </div>
              <input type="range" min={100} max={1000} step={20} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-[color:var(--color-primary)]" />
            </div>

            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-border">
              <span className="text-sm font-medium">Available now only</span>
              <span className={`relative w-10 h-6 rounded-full transition ${availOnly ? "bg-primary" : "bg-muted"}`} onClick={() => setAvailOnly(!availOnly)}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${availOnly ? "left-[18px]" : "left-0.5"}`} />
              </span>
            </label>
          </div>
        </aside>

        <main>
          <div className="flex items-baseline justify-between mb-5">
            <h1 className="text-xl font-semibold">
              {loading ? "Searching…" : `${filtered.length} ${filtered.length === 1 ? "worker" : "workers"} found`}
            </h1>
            <span className="text-xs text-muted-foreground">Ranked by {sort === "ml" ? "ML Score" : sort}</span>
          </div>

          {loading ? (
            <div className="card-soft p-16 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Running ML ranking…</p>
            </div>
          ) : error ? (
            <div className="card-soft p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-semibold text-lg">Couldn't load workers</h3>
              <p className="text-muted-foreground text-sm mt-1">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-soft p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No workers match your filters</h3>
              <p className="text-muted-foreground text-sm mt-1">Try relaxing the price or rating filter.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((w, i) => (
                <WorkerCard key={w.id} worker={w} rank={sort === "ml" ? i + 1 : undefined} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`text-xs px-2.5 py-1 rounded-md border transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary/40"}`}>
      {children}
    </button>
  );
}