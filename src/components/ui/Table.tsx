import type { ReactNode, TdHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm">{children}</table></div>
);
export const Th = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th className={cn("bg-[#f6f8f5] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#8b9591]", className)}>{children}</th>
);
export const Td = ({ children, className, ...p }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("border-b border-[#edf0ed] px-4 py-3.5 align-middle text-[#55615c]", className)} {...p}>{children}</td>
);
export const Tr = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
  <tr onClick={onClick} className={cn("transition hover:bg-[#fafbf9]", onClick && "cursor-pointer")}>{children}</tr>
);
