import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("border border-[#e1e5e1] bg-white", className)}>{children}</div>
);

export function StatCard({ label, value, icon, foot, tone = "green" }: { label: string; value: ReactNode; icon: ReactNode; foot?: ReactNode; tone?: "green" | "blue" | "amber" | "red" }) {
  const tones = { green: "bg-[#eaf5e9] text-[#2a8057]", blue: "bg-[#edf1fa] text-[#5570b2]", amber: "bg-[#f6f0db] text-[#ad8b24]", red: "bg-[#fae9e6] text-[#bc5c54]" };
  return (
    <Card className="relative p-5">
      <span className={cn("absolute right-4 top-4 grid size-9 place-items-center rounded-[5px]", tones[tone])}>{icon}</span>
      <p className="text-xs text-muted">{label}</p>
      <p className="my-3 font-display text-2xl font-bold">{value}</p>
      {foot && <div className="border-t border-[#edf0ed] pt-3 text-[11px] text-muted">{foot}</div>}
    </Card>
  );
}
