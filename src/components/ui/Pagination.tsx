import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Paged } from "@/lib/types";
import { Button } from "./Button";

export function Pagination({ meta, onPage }: { meta?: Paged<unknown>["meta"]; onPage: (p: number) => void }) {
  if (!meta || meta.total === 0) return null;
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  return (
    <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
      <span>{from}–{to} sur {meta.total}</span>
      <div className="flex gap-1.5">
        <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} icon={<ChevronLeft size={14} />}>Précédent</Button>
        <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>Suivant<ChevronRight size={14} /></Button>
      </div>
    </div>
  );
}
