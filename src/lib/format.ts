const nf = new Intl.NumberFormat("fr-FR");

export const fcfa = (n: number | null | undefined) => (n == null ? "—" : `${nf.format(n)} FCFA`);
export const num = (n: number | null | undefined) => (n == null ? "—" : nf.format(n));

export const dateFr = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—";

export const dateTimeFr = (d: string | Date) =>
  new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export const period = (a: string, b: string) => {
  const s = new Date(a), e = new Date(b);
  const fmt = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString("fr-FR", { day: "2-digit", ...(withMonth && { month: "short" }), timeZone: "UTC" });
  return `${fmt(s, s.getUTCMonth() !== e.getUTCMonth())}–${e.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}`;
};

/** Valeur d'un <input type="date"> à partir d'une date ISO. */
export const toInputDate = (d?: string | null) => (d ? d.slice(0, 10) : "");
export const today = () => new Date().toISOString().slice(0, 10);

export const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" }).replace(".", "");
