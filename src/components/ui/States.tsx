import { errorMessage } from "@/lib/api";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export const Spinner = ({ label = "Chargement…" }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
    <Loader2 size={18} className="animate-spin" />
    {label}
  </div>
);

export const Empty = ({
  children = "Aucun résultat",
  action,
}: {
  children?: ReactNode;
  action?: ReactNode;
}) => (
  <div className="grid place-items-center gap-3 py-14 text-center text-sm text-muted">
    <Inbox size={28} className="text-[#b9c2be]" />
    {children}
    {action}
  </div>
);

export const ErrorBox = ({ error }: { error: unknown }) => (
  <div className="m-4 flex items-center gap-2 border border-[#f1c9c4] bg-[#fdf1ef] p-4 text-sm text-[#a2433b]">
    <AlertCircle size={18} />
    {errorMessage(error)}
  </div>
);

/** Affiche chargement / erreur / vide puis le contenu. */
export function QueryState({
  q,
  empty,
  children,
}: {
  q: { isLoading: boolean; error: unknown; data?: unknown };
  empty?: boolean;
  children: ReactNode;
}) {
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorBox error={q.error} />;
  if (empty) return <Empty />;
  return <>{children}</>;
}
