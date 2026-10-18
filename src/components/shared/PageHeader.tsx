import type { ReactNode } from "react";

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    {action}
  </div>
);
