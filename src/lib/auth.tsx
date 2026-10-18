import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, tokenStore } from "./api";
import type { User } from "./types";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    if (tokenStore.get())
      api
        .get<User>("/auth/me")
        .then(setUser)
        .catch(logout)
        .finally(() => setLoading(false));
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    });
    tokenStore.set(res.token);
    setUser(res.user);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

/** Protège les routes de l'espace admin. */
export function RequireAuth({
  children,
  role,
}: {
  children: ReactNode;
  role?: "ADMIN";
}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-muted">
        Chargement…
      </div>
    );
  if (!user)
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  if (role && user.role !== role) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
