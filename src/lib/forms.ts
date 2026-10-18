import { useState, type ChangeEvent } from "react";

type El = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

/** État de formulaire simple : toutes les valeurs sont des chaînes (convertir à l'envoi avec `num` / `numOrNull`). */
export function useForm<T extends Record<string, string | boolean>>(initial: T) {
  const [v, setV] = useState(initial);
  const bind = <K extends keyof T & string>(k: K) => ({
    value: (v[k] ?? "") as string,
    onChange: (e: El) => setV((s) => ({ ...s, [k]: e.target.value })),
  });
  const check = <K extends keyof T & string>(k: K) => ({
    label: "",
    checked: !!v[k],
    onChange: (e: El) => setV((s) => ({ ...s, [k]: (e.target as HTMLInputElement).checked })),
  });
  return { v, setV, bind, check };
}

export const num = (s: string) => Number(s);
export const numOrNull = (s: string) => (s === "" ? null : Number(s));
export const strOrNull = (s: string) => (s.trim() === "" ? null : s.trim());
