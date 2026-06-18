import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export type Role = "user" | "admin" | "worker";

// Extra fields that only apply to worker accounts
export type WorkerProfile = {
  skill?: string;
  subSkills?: string[];
  experience?: number;
  city?: string;
  area?: string;
  jobsCompleted?: number;
  previousEmployer?: string;
  portfolio?: string[];
  aadhar?: string;
  license?: string;
  pricePerHour?: number;
  mlScore?: number;
  rating?: number;
  reviewCount?: number;
  available?: boolean;
  verified?: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
} & WorkerProfile;

type SignupExtra = Partial<WorkerProfile>;

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role?: Role) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string, role?: Role, extra?: SignupExtra) => Promise<AuthUser>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "ayn.auth.user";

type DBUser = { email: string; password: string; name: string; role: Role } & WorkerProfile;

// Seed accounts so every role can be tried out of the box
const SEED: DBUser[] = [
  { email: "admin@ayn.com", password: "admin123", name: "Admin", role: "admin" },
  { email: "demo@ayn.com", password: "demo1234", name: "Aakash", role: "user" },
  {
    email: "worker@ayn.com", password: "worker123", name: "Ravi Kumar", role: "worker",
    skill: "Electrician", subSkills: ["Wiring", "Panel install", "Smart home"],
    experience: 9, city: "Bengaluru", area: "Indiranagar", jobsCompleted: 612,
    pricePerHour: 450, mlScore: 96, rating: 4.9, reviewCount: 248,
    available: true, verified: true,
  },
];

function readUsersDB(): DBUser[] {
  if (typeof window === "undefined") return SEED;
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
function writeUsersDB(db: DBUser[]) {
  if (typeof window === "undefined") return;
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
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login: AuthCtx["login"] = async (email, password, role) => {
    await new Promise((r) => setTimeout(r, 400));
    const db = readUsersDB();
    const match = db.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!match) throw new Error("Invalid email or password");
    if (role && match.role !== role) throw new Error(`This account is not a ${role} account`);
    const { password: _pw, ...rest } = match;
    const u: AuthUser = {
      ...rest,
      id: match.email,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(match.email)}`,
    };
    persist(u);
    return u;
  };

  const signup: AuthCtx["signup"] = async (name, email, password, role = "user", extra) => {
    await new Promise((r) => setTimeout(r, 400));
    const db = readUsersDB();
    if (db.find((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email already registered");
    const newDbUser: DBUser = { email, password, name, role, ...extra };
    db.push(newDbUser);
    writeUsersDB(db);
    const { password: _pw, ...rest } = newDbUser;
    const u: AuthUser = {
      ...rest,
      id: email,
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: pathname, mode: role === "admin" ? "admin" : "user" } as any });
    } else if (role && user.role !== role) {
      navigate({ to: "/login", search: { redirect: pathname, mode: role } as any });
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