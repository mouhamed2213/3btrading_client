import { CheckCircle2, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Item = { id: number; kind: "success" | "error"; text: string };
type Ctx = { success: (t: string) => void; error: (t: string) => void };
const ToastCtx = createContext<Ctx | null>(null);
let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const push = useCallback((kind: Item["kind"], text: string) => {
    const id = ++seq;
    setItems((l) => [...l, { id, kind, text }]);
    setTimeout(() => setItems((l) => l.filter((i) => i.id !== id)), 4000);
  }, []);
  const api = { success: (t: string) => push("success", t), error: (t: string) => push("error", t) };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="no-print fixed bottom-5 right-5 z-[300] grid gap-2">
        {items.map((i) => (
          <div key={i.id} className="flex max-w-sm animate-fade-up items-center gap-3 bg-ink px-4 py-3 text-sm text-white shadow-xl">
            <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", i.kind === "success" ? "bg-lime text-brand" : "bg-danger text-white")}>
              {i.kind === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            </span>
            {i.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>");
  return ctx;
}
