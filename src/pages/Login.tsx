import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sparkles, Shield, User as UserIcon, Loader2, AlertCircle } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || undefined;
  const initialMode = params.get("mode") === "admin" ? "admin" : "user";
  const [tab, setTab] = useState<"user" | "admin">(initialMode);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState(initialMode === "admin" ? "admin@ayn.com" : "demo@ayn.com");
  const [password, setPassword] = useState(initialMode === "admin" ? "admin123" : "demo1234");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Sign in — Acquire·Your·Need"; }, []);

  const switchTab = (t: "user" | "admin") => {
    setTab(t);
    setIsSignup(false);
    setErr(null);
    setEmail(t === "admin" ? "admin@ayn.com" : "demo@ayn.com");
    setPassword(t === "admin" ? "admin123" : "demo1234");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const role: Role = tab === "admin" ? "admin" : "user";
      const u = isSignup
        ? await signup(name || email.split("@")[0], email, password, role)
        : await login(email, password, role);
      const dest = redirect || (u.role === "admin" ? "/admin" : "/dashboard");
      navigate(dest);
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white relative overflow-hidden grid place-items-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl animate-float-slow"
             style={{ background: "radial-gradient(circle, oklch(0.55 0.18 162) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-float-slower"
             style={{ background: "radial-gradient(circle, oklch(0.45 0.2 250) 0%, transparent 70%)" }} />
      </div>
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-emerald-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight">Acquire·Your·Need</span>
        </Link>

        <div className="glass rounded-2xl p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-lg mb-6">
            {(["user", "admin"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`text-sm py-2 rounded-md font-medium transition flex items-center justify-center gap-1.5 ${
                  tab === t ? "bg-white text-navy" : "text-white/70 hover:text-white"
                }`}
              >
                {t === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                {t === "user" ? "User" : "Admin"}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold">{isSignup ? "Create account" : tab === "admin" ? "Admin sign in" : "Welcome back"}</h1>
          <p className="text-white/60 text-sm mt-1">
            {isSignup ? "Hire workers and track your jobs." : tab === "admin" ? "Manage workers, users and platform health." : "Sign in to hire and track jobs."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {isSignup && tab === "user" && (
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-primary text-sm" />
              </Field>
            )}
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-primary text-sm" />
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-primary text-sm" />
            </Field>

            {err && (
              <div className="flex items-start gap-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {err}
              </div>
            )}

            <button disabled={busy} type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2.5 font-medium transition shadow-[0_8px_24px_-8px_rgba(29,158,117,0.6)] flex items-center justify-center gap-2 disabled:opacity-60">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          {tab === "user" && (
            <div className="text-center mt-5 text-sm text-white/60">
              {isSignup ? "Already have an account? " : "New here? "}
              <button onClick={() => { setIsSignup(!isSignup); setErr(null); }} className="text-primary hover:underline font-medium">
                {isSignup ? "Sign in" : "Create one"}
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-white/10 text-xs text-white/50 space-y-1">
            <div className="font-semibold text-white/70 uppercase tracking-wider text-[10px]">Demo credentials</div>
            <div>User · demo@ayn.com / demo1234</div>
            <div>Admin · admin@ayn.com / admin123</div>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-white/60">
          Are you a skilled worker?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">Apply to join</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/60 font-semibold">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
