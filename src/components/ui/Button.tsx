import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Variant = "primary" | "dark" | "outline" | "ghost" | "danger" | "glass";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-lime text-brand hover:bg-lime-soft",
  dark: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-line bg-white text-ink hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90",
  glass: "border border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/10",
};
const sizes: Record<Size, string> = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-[52px] px-6 text-[15px]" };

/** Classes de bouton, réutilisables sur un <Link>. */
export const buttonClass = (variant: Variant = "primary", size: Size = "md", extra?: string) =>
  cn("inline-flex items-center justify-center gap-2 rounded-[5px] font-bold transition disabled:pointer-events-none", variants[variant], sizes[size], extra);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean; icon?: ReactNode };

export function Button({ variant = "primary", size = "md", loading, icon, children, className, disabled, type = "button", ...rest }: Props) {
  return (
    <button type={type} disabled={disabled || loading} className={buttonClass(variant, size, className)} {...rest}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
