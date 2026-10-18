import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/labels";

const tones: Record<Tone, string> = {
  green: "bg-[#e9f5ed] text-[#2c8257]", blue: "bg-[#eaf0fa] text-[#4e6da9]", amber: "bg-[#fff3d9] text-[#a67c19]",
  red: "bg-[#fbe9e6] text-[#b5483f]", gray: "bg-[#eef0ef] text-[#717d78]",
};

export const Badge = ({ tone = "gray", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold", tones[tone], className)}>{children}</span>
);

/** Badge piloté par un dictionnaire de libellés (lib/labels). */
export const StatusBadge = ({ map, value }: { map: Record<string, { label: string; tone?: Tone }>; value: string }) => (
  <Badge tone={map[value]?.tone}>{map[value]?.label ?? value}</Badge>
);
