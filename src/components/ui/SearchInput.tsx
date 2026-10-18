import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export const SearchInput = ({ value, onChange, placeholder = "Rechercher…", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) => (
  <label className={cn("flex h-10 items-center gap-2 border border-line bg-white px-3 text-muted focus-within:border-olive", className)}>
    <Search size={16} />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm text-ink outline-none" />
  </label>
);
