const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
// const BASE = import.meta.env.VITE_API_URL ?? "https://abdominal-corridor-sanctity.ngrok-free.dev:4000/api";

const TOKEN_KEY = "3bt_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: { path: string; message: string }[]) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export const qs = (params?: Query) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = tokenStore.get();
  const isForm = body instanceof FormData;
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Session expirée : retour à la connexion (sauf pendant la tentative de connexion elle-même)
    if (res.status === 401 && token && !path.startsWith("/auth/login")) {
      tokenStore.clear();
      window.dispatchEvent(new Event("auth:expired"));
    }
    throw new ApiError(res.status, data?.error?.message ?? "Erreur serveur", data?.error?.details);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, params?: Query) => request<T>("GET", path + qs(params)),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T = void>(path: string) => request<T>("DELETE", path),
};

/** Message lisible pour un formulaire (détail du premier champ invalide si disponible). */
export const errorMessage = (e: unknown) => {
  if (e instanceof ApiError) return e.details?.[0] ? `${e.message} — ${e.details[0].path} : ${e.details[0].message}` : e.message;
  return e instanceof Error ? e.message : "Une erreur est survenue";
};
