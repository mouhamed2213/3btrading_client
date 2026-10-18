import { useToast } from "@/components/ui/Toast";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, errorMessage } from "./api";

type Query = Record<string, string | number | boolean | undefined | null>;

/** Lecture d'une ressource : la clé de cache = chemin + paramètres. */
export function useApi<T>(
  path: string,
  params?: Query,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [path, params ?? {}],
    queryFn: () => api.get<T>(path, params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

/** Écriture : toast de succès/erreur, puis rafraîchissement de toutes les données (flotte, factures, tableau de bord… sont liés). */
export function useAction<V = void, R = unknown>(
  fn: (v: V) => Promise<R>,
  opts?: { success?: string; onSuccess?: (r: R) => void },
) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      qc.invalidateQueries();
      if (opts?.success) toast.success(opts.success);
      opts?.onSuccess?.(r);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

/** Petit debounce pour les champs de recherche. */
import { useEffect, useState } from "react";
export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
