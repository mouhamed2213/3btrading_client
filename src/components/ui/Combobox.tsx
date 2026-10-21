import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/cn";
import { inputCls } from "./Field";

export type ComboOption = { value: string; label: string; description?: string };

type Props = {
  value: string;
  /** Même signature qu'un <select> : fonctionne directement avec `bind("champ")`. */
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: ComboOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  /** Affiche une ligne « — placeholder — » pour vider la sélection. */
  clearable?: boolean;
  loading?: boolean;
  /** Recherche côté serveur : si fourni, la liste n'est pas filtrée localement (les `options` sont déjà filtrées). */
  onSearchChange?: (query: string) => void;
  emptyText?: string;
};

const MAX_ROWS = 100;
/** Minuscules sans accents : « electricite » trouve « Électricité ». */
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Liste déroulante avec recherche intégrée, pour les listes longues (clients, engins, pièces, catégories…). */
export function Combobox({
  value, onChange, options, placeholder = "Choisir…", searchPlaceholder = "Rechercher…", disabled, className,
  clearable = true, loading, onSearchChange, emptyText = "Aucun résultat", 
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selected = options.find((o) => o.value === value);
  const rows = useMemo(() => {
    const tokens = norm(query).split(/\s+/).filter(Boolean);
    const filtered = onSearchChange || tokens.length === 0 ? options : options.filter((o) => { const hay = norm(`${o.label} ${o.description ?? ""}`); return tokens.every((t) => hay.includes(t)); });
    return filtered.slice(0, MAX_ROWS);
  }, [options, query, onSearchChange]);
  const hasMore = (onSearchChange ? options.length : rows.length) >= MAX_ROWS;
  const showClear = clearable && value !== "" && query === "";
  const items: ComboOption[] = showClear ? [{ value: "", label: `— ${placeholder.replace(/^—\s*|\s*—$/g, "")} —` }, ...rows] : rows;

  const close = () => { setOpen(false); setQuery(""); onSearchChange?.(""); };
  const openList = () => {
    if (disabled) return;
    const r = root.current?.getBoundingClientRect();
    setUp(!!r && window.innerHeight - r.bottom < 320 && r.top > window.innerHeight - r.bottom);
    setActive(Math.max(0, items.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const pick = (v: string) => { onChange({ target: { value: v } } as ChangeEvent<HTMLSelectElement>); close(); };

  useEffect(() => { if (open) search.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) close(); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => { listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView?.({ block: "nearest" }); }, [active, open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const o = items[active]; if (o) pick(o.value); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === "Tab") close();
  };

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button" role="combobox" aria-expanded={open} aria-controls={id} aria-haspopup="listbox" disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); openList(); } }}
        className={cn(inputCls, "flex h-10 items-center justify-between gap-2 text-left", open && "border-olive ring-2 ring-lime/40")}
      >
        <span className={cn("truncate", !selected && "text-[#a0a9a5]")}>{selected ? selected.label : value && loading ? "Chargement…" : placeholder}</span>
        <ChevronDown size={16} className={cn("shrink-0 text-muted transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn("absolute z-50 w-full min-w-[220px] border border-line bg-white shadow-xl", up ? "bottom-full mb-1" : "top-full mt-1")}
          // Le champ est dans un <label> : sans ça, un clic dans la liste réactiverait le bouton et la refermerait.
          onClick={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Search size={15} className="shrink-0 text-muted" />
            <input
              ref={search} value={query} placeholder={searchPlaceholder} aria-label="Rechercher dans la liste" autoComplete="off"
              onChange={(e) => { setQuery(e.target.value); setActive(0); onSearchChange?.(e.target.value); }} onKeyDown={onKey}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-[#a0a9a5]"
            />
            {loading && <Loader2 size={15} className="shrink-0 animate-spin text-muted" />}
          </div>
          <div ref={listRef} id={id} role="listbox" className="max-h-60 overflow-y-auto py-1">
            {items.length === 0 && <p className="px-3 py-4 text-center text-xs text-muted">{loading ? "Recherche…" : emptyText}</p>}
            {items.map((o, i) => (
              <div
                key={o.value || "__clear"} data-i={i} role="option" aria-selected={o.value === value}
                onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.preventDefault(); pick(o.value); }}
                className={cn("flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm", i === active && "bg-surface", o.value === "" && "text-muted", o.value === value && o.value !== "" && "font-bold")}
              >
                <span className="grid min-w-0"><span className="truncate">{o.label}</span>{o.description && <small className="truncate text-[11px] font-normal text-muted">{o.description}</small>}</span>
                {o.value === value && o.value !== "" && <Check size={15} className="shrink-0 text-olive" />}
              </div>
            ))}
            {hasMore && <p className="border-t border-line px-3 py-2 text-center text-[11px] text-muted">Affichage limité à {MAX_ROWS} résultats — affinez la recherche.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
