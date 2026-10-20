import { cn } from "@/lib/cn";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const inputCls =
  "w-full rounded-[5px] border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-[#a0a9a5] focus:border-olive focus:ring-2 focus:ring-lime/40 disabled:bg-surface";

export function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("grid content-start gap-1.5", className)}>
      {label && (
        <span className="text-xs font-bold text-[#57635d]">{label}</span>
      )}
      {children}
      {hint && !error && <span className="text-[11px] text-muted">{hint}</span>}
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </label>
  );
}

export const Input = ({
  className,
  ...p
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(inputCls, "h-10", className)} {...p} />
);
export const Select = ({
  className,
  ...p
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(inputCls, "h-10", className)} {...p} />
);
export const Textarea = ({
  className,
  ...p
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(inputCls, "min-h-20 py-2.5", className)} {...p} />
);

export function Checkbox({
  label,
  ...p
}: { label: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-brand" {...p} />
      {label}
    </label>
  );
}

export const Options = ({
  items,
  placeholder,
}: {
  items: { value: string; label: string }[];
  placeholder?: string;
}) => (
  <>
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {items.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </>
);
