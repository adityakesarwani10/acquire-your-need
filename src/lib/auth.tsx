import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export type Role = "user" | "admin" | "worker";
export type AuthUser = { id: string; name: string; email: string; role: Role; avatar: string };

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role?: Role) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string, role?: Role) => Promise<AuthUser>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "ayn.auth.user";

const SEED = [
  { email: "admin@ayn.com", password: "admin123", name: "Admin", role: "admin" as Role },
  { email: "demo@ayn.com", password: "demo1234", name: "Aakash", role: "user" as Role },
];

function readUsersDB() {
  try {
    const raw = localStorage.getItem("ayn.users");
    const arr = raw ? JSON.parse(raw) : [];
    const merged = [...SEED];
    for (const u of arr) if (!merged.find((m) => m.email === u.email)) merged.push(u);
    return merged;
  } catch {
    return SEED;
  }
}
function writeUsersDB(db: Array<{ email: string; password: string; name: string; role: Role }>) {
  const custom = db.filter((u) => !SEED.find((s) => s.email === u.email));
  localStorage.setItem("ayn.users", JSON.stringify(custom));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login: AuthCtx["login"] = async (email, password, role) => {
    await new Promise((r) => setTimeout(r, 400));
    const db = readUsersDB();
    const match = db.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!match) throw new Error("Invalid email or password");
    if (role && match.role !== role) throw new Error(`This account is not a ${role} account`);
    const u: AuthUser = {
      id: match.email, name: match.name, email: match.email, role: match.role,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(match.email)}`,
    };
    persist(u);
    return u;
  };

  const signup: AuthCtx["signup"] = async (name, email, password, role = "user") => {
    await new Promise((r) => setTimeout(r, 400));
    const db = readUsersDB();
    if (db.find((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email already registered");
    db.push({ email, password, name, role });
    writeUsersDB(db);
    const u: AuthUser = {
      id: email, name, email, role,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(email)}`,
    };
    persist(u);
    return u;
  };

  const logout = () => persist(null);

  return <Ctx.Provider value={{ user, loading, login, signup, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}

export function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const mode = role === "admin" ? "admin" : "user";
      navigate(`/login?redirect=${encodeURIComponent(pathname)}&mode=${mode}`, { replace: true });
    } else if (role && user.role !== role) {
      navigate(`/login?redirect=${encodeURIComponent(pathname)}&mode=${role}`, { replace: true });
    }
  }, [user, loading, role, navigate, pathname]);

  if (loading || !user || (role && user.role !== role)) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Checking access…</div>
      </div>
    );
  }
  return <>{children}</>;
}
