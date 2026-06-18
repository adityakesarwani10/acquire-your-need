import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check, ArrowRight, ArrowLeft, Upload, Sparkles, X } from "lucide-react";

const STEPS = [
  { n: 1, title: "Basics", sub: "Tell us who you are" },
  { n: 2, title: "Profession", sub: "What do you do?" },
  { n: 3, title: "Experience", sub: "Show your work" },
  { n: 4, title: "Verification", sub: "Build trust" },
];

const SKILLS = ["Electrician", "Plumber", "Carpenter", "Painter", "AC Technician", "Cleaner", "Mason"];
const SUB_BY_SKILL: Record<string, string[]> = {
  Electrician: ["Wiring", "Panel install", "Smart home", "Fan & light fitting", "Inverter"],
  Plumber: ["Leak repair", "Bathroom fitting", "Water heater", "Pipe fitting", "Drainage"],
  Carpenter: ["Modular kitchen", "Wardrobe", "Doors", "Furniture repair"],
  Painter: ["Interior", "Exterior", "Texture", "Waterproofing"],
  "AC Technician": ["Installation", "Servicing", "Gas refill", "Repair"],
  Cleaner: ["Deep clean", "Bathroom", "Kitchen", "Move-in/out"],
  Mason: ["Brickwork", "Plastering", "Tiling"],
};

export default function Signup() {
  useEffect(() => { document.title = "Become a pro — Acquire·Your·Need"; }, []);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: "", email: "", phone: "", password: "",
    skill: "", subSkills: [] as string[], experience: 3, city: "Bengaluru", area: "",
    jobs: "", previousEmployer: "", portfolio: [] as string[],
    aadhar: "", license: "", photo: "",
  });

  const update = (k: keyof typeof data, v: any) => setData((d) => ({ ...d, [k]: v }));

  const valid =
    step === 1 ? data.name && data.email.includes("@") && data.phone.length >= 10 && data.password.length >= 6 :
    step === 2 ? data.skill && data.subSkills.length > 0 && data.area :
    step === 3 ? data.jobs : true;

  const next = () => valid && setStep(Math.min(4, step + 1));
  const back = () => setStep(Math.max(1, step - 1));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[color:var(--color-primary-glow)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">Acquire·Your·Need</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Cancel</Link>
        </div>
      </header>

      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% complete</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-[color:var(--color-primary-glow)] rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-5">
            {STEPS.map((s) => (
              <div key={s.n} className={`text-center transition ${step >= s.n ? "opacity-100" : "opacity-40"}`}>
                <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${step > s.n ? "bg-primary text-primary-foreground" : step === s.n ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                  {step > s.n ? <Check className="w-4 h-4" /> : s.n}
                </div>
                <div className="text-xs font-medium mt-2 hidden sm:block">{s.title}</div>
                <div className="text-[10px] text-muted-foreground hidden sm:block">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div key={step} className="card-soft p-6 md:p-8 animate-count-up">
          {step === 1 && (
            <div className="space-y-5">
              <Heading title="Let's get started" sub="Basic information about you." />
              <Field label="Full name" value={data.name} onChange={(v) => update("name", v)} placeholder="Ravi Kumar" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email" value={data.email} onChange={(v) => update("email", v)} placeholder="you@example.com" type="email" />
                <Field label="Phone" value={data.phone} onChange={(v) => update("phone", v)} placeholder="+91 98765 43210" type="tel" />
              </div>
              <Field label="Password" value={data.password} onChange={(v) => update("password", v)} type="password" placeholder="Minimum 6 characters" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Heading title="Your profession" sub="Help customers find you." />
              <div>
                <Label>Primary skill</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {SKILLS.map((s) => (
                    <button key={s} onClick={() => { update("skill", s); update("subSkills", []); }}
                      className={`px-3 py-2.5 rounded-lg border text-sm transition ${data.skill === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {data.skill && (
                <div className="animate-count-up">
                  <Label>Sub-skills (pick all that apply)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SUB_BY_SKILL[data.skill]?.map((s) => {
                      const on = data.subSkills.includes(s);
                      return (
                        <button key={s} onClick={() => update("subSkills", on ? data.subSkills.filter(x => x !== s) : [...data.subSkills, s])}
                          className={`text-xs px-3 py-1.5 rounded-md border transition ${on ? "bg-primary/10 text-primary border-primary" : "border-border hover:border-primary/50"}`}>
                          {on && <Check className="w-3 h-3 inline mr-1" />}{s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <div className="flex justify-between mb-2"><Label>Years of experience</Label><span className="text-sm font-semibold text-primary tabular-nums">{data.experience}y</span></div>
                <input type="range" min={0} max={25} value={data.experience} onChange={(e) => update("experience", +e.target.value)} className="w-full accent-[color:var(--color-primary)]" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="City" value={data.city} onChange={(v) => update("city", v)} />
                <Field label="Area / locality" value={data.area} onChange={(v) => update("area", v)} placeholder="Indiranagar" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Heading title="Your work history" sub="Customers love proof of experience." />
              <Field label="Jobs completed (approx.)" value={data.jobs} onChange={(v) => update("jobs", v)} placeholder="e.g. 150" type="number" />
              <Field label="Previous employer (optional)" value={data.previousEmployer} onChange={(v) => update("previousEmployer", v)} placeholder="ABC Services Pvt Ltd" />
              <div>
                <Label>Portfolio photos</Label>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {data.portfolio.map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-muted to-secondary relative group">
                      <button onClick={() => update("portfolio", data.portfolio.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 grid place-items-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => update("portfolio", [...data.portfolio, "x"])}
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition flex flex-col items-center justify-center text-muted-foreground hover:text-primary">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs mt-1">Add photo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <Heading title="Verification" sub="Optional — but verified pros earn 3× more." />
              <Field label="Aadhar number (optional)" value={data.aadhar} onChange={(v) => update("aadhar", v)} placeholder="XXXX XXXX XXXX" />
              <Field label="Trade license # (optional)" value={data.license} onChange={(v) => update("license", v)} />
              <div>
                <Label>Profile photo</Label>
                <button className="mt-2 w-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition rounded-xl py-10 flex flex-col items-center justify-center text-muted-foreground hover:text-primary">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm mt-2 font-medium">Upload a clear face photo</span>
                  <span className="text-xs">PNG, JPG — max 5 MB</span>
                </button>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm text-foreground">
                <strong className="text-primary">Almost there!</strong> Click finish to submit. We'll verify your details within 24 hours.
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-3">
            <button onClick={back} disabled={step === 1} className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < 4 ? (
              <button onClick={next} disabled={!valid} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_14px_-4px_rgba(29,158,117,0.5)]">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition shadow-[0_4px_14px_-4px_rgba(29,158,117,0.5)]">
                Finish & submit <Check className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-foreground">{children}</label>;
}
function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-2 w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition" />
    </div>
  );
}
