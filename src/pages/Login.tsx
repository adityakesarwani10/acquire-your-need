import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sparkles, Shield, User as UserIcon, Wrench, Loader2, AlertCircle } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";

const ROLE_OPTIONS: { value: Role; label: string; icon: typeof UserIcon }[] = [
  { value: "user", label: "User", icon: UserIcon },
  { value: "worker", label: "Worker", icon: Wrench },
  { value: "admin", label: "Admin", icon: Shield },
];

const DEMO_CREDS: Record<Role, { email: string; password: string }> = {
  user: { email: "demo@ayn.com", password: "demo1234" },
  worker: { email: "worker@ayn.com", password: "worker123" },
  admin: { email: "admin@ayn.com", password: "admin123" },
};

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || undefined;
  const initialRole = (params.get("mode") as Role) || "user";

  const [role, setRole] = useState<Role>(initialRole);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState(DEMO_CREDS[initialRole]?.email ?? DEMO_CREDS.user.email);
  const [password, setPassword] = useState(DEMO_CREDS[initialRole]?.password ?? DEMO_CREDS.user.password);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Sign in — Acquire·Your·Need"; }, []);

  const switchRole = (r: Role) => {
    setRole(r);
    setIsSignup(false);
    setErr(null);
    setEmail(DEMO_CREDS[r].email);
    setPassword(DEMO_CREDS[r].password);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const u = isSignup
        ? await signup(name || email.split("@")[0], email, password, role)
        : await login(email, password, role);
      const dest = redirect || (u.role === "admin" ? "/admin" : u.role === "worker" ? "/worker-dashboard" : "/dashboard");
      navigate(dest);
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const roleCopy: Record<Role, { title: string; subtitle: string }> = {
    user: { title: "Welcome back", subtitle: "Sign in to hire and track jobs." },
    worker: { title: "Welcome back", subtitle: "Sign in to manage requests and your profile." },
    admin: { title: "Welcome back", subtitle: "Sign in to manage workers, users and platform health." },
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
          {/* Single unified role selector — User / Worker / Admin styled identically, no special "admin showcase" */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-lg mb-6">
            {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => switchRole(value)}
                className={`text-sm py-2 rounded-md font-medium transition flex items-center justify-center gap-1.5 ${
                  role === value ? "bg-white text-navy" : "text-white/70 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold">{isSignup ? "Create account" : roleCopy[role].title}</h1>
          <p className="text-white/60 text-sm mt-1">
            {isSignup ? "Hire workers and track your jobs." : roleCopy[role].subtitle}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {isSignup && role === "user" && (
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

          {role === "user" && (
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
            <div>Worker · worker@ayn.com / worker123</div>
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