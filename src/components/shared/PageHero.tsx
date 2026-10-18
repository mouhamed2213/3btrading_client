import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const Eyebrow = ({ children, light }: { children: ReactNode; light?: boolean }) => (
  <div className={cn("mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.17em]", light ? "text-[#d7dedb]" : "text-[#5f6c66]")}>
    <span className={cn("block h-0.5 w-8", light ? "bg-lime" : "bg-brand")} />{children}
  </div>
);

/** Bandeau vert des pages publiques ; `<em>` dans le titre = mot en couleur. */
export const PageHero = ({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) => (
  <section className="bg-brand px-[5vw] pb-28 pt-20 text-white">
    <div className="mx-auto max-w-[1260px]">
      <Eyebrow light>{eyebrow}</Eyebrow>
      <h1 className="font-display text-[clamp(42px,5vw,68px)] font-semibold leading-none tracking-[-.05em] [&_em]:not-italic [&_em]:text-lime">{title}</h1>
      {children && <p className="mt-6 max-w-2xl text-[17px] text-[#bdc9c4]">{children}</p>}
    </div>
  </section>
);
