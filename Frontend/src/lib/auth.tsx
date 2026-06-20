import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiLogin, apiRegister, apiMe, getToken, setToken, ApiError, type ApiUser } from "./api";

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
  phone?: string;
  bio?: string;
  responseTime?: string;
  completionRate?: number;
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
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
console.log("Auth context initialized"); // Debugging line to confirm context creation

function fromApiUser(u: ApiUser): AuthUser {
  return { ...u, id: u.id, role: u.role as Role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists, fetch the fresh user from the backend.
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      try {
        const { user: apiUser } = await apiMe();
        setUser(fromApiUser(apiUser));
      } catch {
        setToken(null); // stale/invalid token
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login: AuthCtx["login"] = async (email, password, role) => {
    const { token, user: apiUser } = await apiLogin(email, password, role);
    setToken(token);
    const u = fromApiUser(apiUser);
    setUser(u);
    return u;
  };

  const signup: AuthCtx["signup"] = async (name, email, password, role = "user", extra) => {
    const { token, user: apiUser } = await apiRegister({ name, email, password, role, ...extra });
    setToken(token);
    const u = fromApiUser(apiUser);
    setUser(u);
    return u;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const refresh = async () => {
    if (!getToken()) return;
    try {
      const { user: apiUser } = await apiMe();
      setUser(fromApiUser(apiUser));
    } catch { /* ignore — keep stale user rather than booting them out on a flaky request */ }
  };

  return <Ctx.Provider value={{ user, loading, login, signup, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  console.log("useAuth called, context value:", v); // Debugging line to check context value
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}

// Re-export so callers that only need to detect an auth-related fetch failure can check this.
export { ApiError };

export function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const mode = role ?? "user";
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