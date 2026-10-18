import { cn } from "@/lib/cn";

type Tab<T extends string> = { value: T; label: string; count?: number };

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: Tab<T>[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto border-b border-line", className)}>
      {tabs.map((t) => (
        <button key={t.value} onClick={() => onChange(t.value)} className={cn("relative h-10 whitespace-nowrap px-4 text-xs transition", value === t.value ? "font-bold text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-brand" : "text-muted hover:text-ink")}>
          {t.label}
          {!!t.count && <span className="ml-1.5 rounded-full bg-[#f2dbd7] px-1.5 py-0.5 text-[10px] text-[#a85048]">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
