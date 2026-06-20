/**
 * API client for the Acquire-Your-Need Express + MongoDB backend.
 * Base URL comes from VITE_API_URL (set in .env), defaulting to localhost:5000.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const TOKEN_KEY = "ayn.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let body: any = null;
  try { body = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

// ── Backend "raw" shapes (Mongo _id, etc.) ──────────────────────────────────
export type RawWorker = {
  _id: string;
  name: string; email: string; role: "worker";
  skill: string; subSkills: string[];
  city: string; area: string;
  experience: number; jobsCompleted: number;
  pricePerHour: number; bio: string;
  mlScore: number; rating: number; reviewCount: number;
  available: boolean; verified: boolean;
  avatar: string; phone: string;
  responseTime: string; completionRate: number;
  scoreBreakdown?: { label: string; value: number }[];
};

export type RawReview = {
  _id: string; workerId: string; author: string; authorAvatar: string;
  rating: number; text: string; task: string; verified: boolean; createdAt: string;
};

export type RawJobRequest = {
  _id: string; workerId: string; user: string; task: string;
  location: string; budget: number; status: "pending" | "accepted" | "declined"; createdAt: string;
};

export type RawEarning = {
  _id: string; workerId: string; user: string; task: string;
  amount: number; status: "paid" | "pending"; paidAt?: string; createdAt: string;
};

export type ApiUser = {
  id: string; name: string; email: string; role: "user" | "worker" | "admin"; avatar: string; phone?: string;
  skill?: string; subSkills?: string[]; city?: string; area?: string;
  experience?: number; jobsCompleted?: number; pricePerHour?: number; bio?: string;
  mlScore?: number; rating?: number; reviewCount?: number; available?: boolean; verified?: boolean;
  responseTime?: string; completionRate?: number;
};

// ── Auth ─────────────────────────────────────────────────────────────────────
export function apiRegister(payload: {
  name: string; email: string; password: string; role?: "user" | "worker" | "admin"; phone?: string;
  skill?: string; subSkills?: string[]; experience?: number; city?: string; area?: string;
  jobsCompleted?: number; previousEmployer?: string; portfolio?: string[]; aadhar?: string; license?: string; bio?: string;
}) {
  return request<{ message: string; token: string; user: ApiUser }>("/auth/register", {
    method: "POST", body: JSON.stringify(payload),
  });
}

export function apiLogin(email: string, password: string, role?: "user" | "worker" | "admin") {
  return request<{ message: string; token: string; user: ApiUser }>("/auth/login", {
    method: "POST", body: JSON.stringify({ email, password, role }),
  });
}

export function apiMe() {
  return request<{ user: ApiUser }>("/auth/me");
}

// ── Workers ──────────────────────────────────────────────────────────────────
export function apiSearchWorkers(params: { q?: string; skill?: string; location?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.skill && params.skill !== "all") qs.set("skill", params.skill);
  if (params.location) qs.set("location", params.location);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return request<{ query: string; skill: string; location: string; total: number; workers: RawWorker[] }>(
    `/worker/search${suffix}`
  );
}

export function apiGetAllWorkers() {
  return request<{ total: number; workers: RawWorker[] }>("/worker");
}

export function apiGetWorker(id: string) {
  return request<{ worker: RawWorker; reviews: RawReview[] }>(`/worker/${id}`);
}

export function apiGetCategories() {
  return request<{ categories: string[] }>("/worker/categories/all");
}

export function apiSubmitReview(workerId: string, data: { rating: number; comment: string; task?: string }) {
  return request<{ message: string; review: RawReview; newRating: number }>(`/worker/${workerId}/review`, {
    method: "POST", body: JSON.stringify(data),
  });
}

// ── Job requests (worker side) ───────────────────────────────────────────────
export function apiGetMyJobRequests() {
  return request<{ total: number; requests: RawJobRequest[] }>("/jobs/mine");
}

export function apiCreateJobRequest(data: { workerId: string; task: string; location?: string; budget?: number }) {
  return request<{ message: string; request: RawJobRequest }>("/jobs", {
    method: "POST", body: JSON.stringify(data),
  });
}

export function apiUpdateJobRequest(id: string, status: "accepted" | "declined") {
  return request<{ message: string; request: RawJobRequest }>(`/jobs/${id}`, {
    method: "PATCH", body: JSON.stringify({ status }),
  });
}

// ── Earnings (worker side) ───────────────────────────────────────────────────
export function apiGetMyEarnings() {
  return request<{ total: number; paidTotal: number; pendingTotal: number; earnings: RawEarning[] }>("/earnings/mine");
}

export function apiMarkEarningPaid(id: string) {
  return request<{ message: string; earning: RawEarning }>(`/earnings/${id}/mark-paid`, { method: "PATCH" });
}

// ── Adapters: backend shape → frontend `Worker` shape (id instead of _id, etc.) ──
export function workerFromRaw(w: RawWorker): import("./mock-data").Worker {
  return {
    id: w._id,
    name: w.name,
    skill: w.skill,
    subSkills: w.subSkills || [],
    city: w.city,
    area: w.area,
    rating: w.rating,
    reviewCount: w.reviewCount,
    pricePerHour: w.pricePerHour,
    experience: w.experience,
    jobsCompleted: w.jobsCompleted,
    mlScore: w.mlScore,
    available: w.available,
    verified: w.verified,
    avatar: w.avatar,
    bio: w.bio,
    scoreBreakdown: w.scoreBreakdown || [],
  };
}

export function reviewFromRaw(r: RawReview) {
  return {
    id: r._id,
    author: r.author,
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    text: r.text,
    verified: r.verified,
  };
}