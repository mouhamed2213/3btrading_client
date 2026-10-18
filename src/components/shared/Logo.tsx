import { Truck } from "lucide-react";
import { cn } from "@/lib/cn";

export const Logo = ({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) => (
  <span className={cn("flex items-center gap-2.5 font-display text-xl font-extrabold tracking-wider", dark ? "text-ink" : "text-white")}>
    <span className="grid size-[38px] place-items-center rounded-[9px] bg-lime text-brand"><Truck size={21} /></span>
    {!compact && <span>3B<span className={dark ? "text-olive" : "text-lime"}>TRADING</span></span>}
  </span>
);
