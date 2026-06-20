import { Link } from "react-router-dom";
import { MapPin, Star, BadgeCheck, ArrowRight } from "lucide-react";
import { MLScoreRing } from "./MLScoreRing";
import type { Worker } from "@/lib/mock-data";

export function WorkerCard({ worker, rank }: { worker: Worker; rank?: number }) {
  return (
    <div className="card-soft hover-lift p-5 flex gap-5 relative overflow-hidden group">
      {rank !== undefined && (
        <div className="absolute top-0 left-0 px-3 py-1 bg-navy text-navy-foreground text-xs font-bold rounded-br-xl">
          #{rank}
        </div>
      )}

      <div className="relative shrink-0 mt-3">
        <img src={worker.avatar} alt={worker.name} className="w-20 h-20 rounded-xl bg-muted object-cover" />
        {worker.available && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-card shadow-[0_0_0_3px_rgba(29,158,117,0.18)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground truncate">{worker.name}</h3>
              {worker.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
            </div>
            <p className="text-sm text-muted-foreground">{worker.skill} · {worker.experience}y exp</p>
          </div>
          <MLScoreRing score={worker.mlScore} size={56} stroke={5} />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {worker.subSkills.slice(0, 3).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">{s}</span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-foreground"><Star className="w-3.5 h-3.5 fill-amber text-[color:var(--color-amber)]" /> {worker.rating}<span className="text-muted-foreground">({worker.reviewCount})</span></span>
            <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {worker.area}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold text-foreground">₹{worker.pricePerHour}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">per hour</div>
            </div>
            <Link
              to={`/worker/${worker.id}`}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition"
            >
              View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
