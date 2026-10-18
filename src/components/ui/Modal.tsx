import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};
const widths = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
};

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = "md",
  className,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="no-print fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#0b1f19]/75 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "w-full animate-fade-up bg-white shadow-2xl",
          widths[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-bold">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="grid size-9 place-items-center bg-surface text-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line bg-surface px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
