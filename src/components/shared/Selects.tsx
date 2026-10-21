import { useState, type ChangeEvent } from "react";
import { Combobox, type ComboOption } from "@/components/ui/Combobox";
import { useApi, useDebounced } from "@/lib/hooks";
import { customerType } from "@/lib/labels";
import type { Customer, Equipment, Paged, Part } from "@/lib/types";

type P = { value: string; onChange?: (e: ChangeEvent<HTMLSelectElement>) => void; disabled?: boolean; className?: string };
const noop = () => {};

/** Ajoute l'élément déjà sélectionné s'il n'est pas dans les résultats de la recherche en cours (pour garder son libellé affiché). */
function withSelected(options: ComboOption[], selected?: ComboOption) {
  return selected && !options.some((o) => o.value === selected.value) ? [selected, ...options] : options;
}

/** Choix d'un client : recherche côté serveur (nom, téléphone, NINEA), donc rapide même avec des milliers de clients. */
export function CustomerSelect(props: P) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);
  const list = useApi<Paged<Customer>>("/customers", { q: dq || undefined, limit: 30 });
  const current = useApi<Customer>(`/customers/${props.value}`, undefined, { enabled: !!props.value });
  const toOption = (c: Customer): ComboOption => ({ value: c.id, label: c.name, description: [customerType[c.type]?.label, c.phone].filter(Boolean).join(" · ") });
  const options = withSelected(list.data?.data.map(toOption) ?? [], current.data ? toOption(current.data) : undefined);
  return <Combobox {...props} onChange={props.onChange ?? noop} options={options} placeholder="Choisir un client" searchPlaceholder="Nom, téléphone, NINEA…" onSearchChange={setQ} loading={list.isFetching} />;
}

/** Choix d'un engin : recherche côté serveur (désignation, marque, modèle, code, n° de série). */
export function EquipmentSelect({ rentableOnly, forSaleOnly, availableOnly, placeholder = "Choisir un engin", onSelect, ...props }: P & { rentableOnly?: boolean; forSaleOnly?: boolean; availableOnly?: boolean; placeholder?: string; onSelect?: (e: Equipment) => void }) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);
  const list = useApi<Paged<Equipment>>("/equipment", { q: dq || undefined, limit: 30, isRentable: rentableOnly ? true : undefined, isForSale: forSaleOnly ? true : undefined });
  const current = useApi<Equipment>(`/equipment/${props.value}`, undefined, { enabled: !!props.value });
  const toOption = (e: Equipment): ComboOption => ({ value: e.id, label: `${e.code} · ${e.name}`, description: [e.brand, e.location].filter(Boolean).join(" · ") });
  const options = withSelected(list.data?.data.filter((e) => (availableOnly ? e.status === "DISPONIBLE" : e.status !== "VENDU")).map(toOption) ?? [], current.data ? toOption(current.data) : undefined);
  const onChange = (ev: ChangeEvent<HTMLSelectElement>) => { props.onChange?.(ev); const hit = list.data?.data.find((x) => x.id === ev.target.value); if (hit) onSelect?.(hit); };
  return <Combobox {...props} onChange={onChange} options={options} placeholder={placeholder} searchPlaceholder="Code, désignation, marque, n° de série…" onSearchChange={setQ} loading={list.isFetching} />;
}

/** Choix d'une pièce en stock : recherche côté serveur (nom, marque, référence OEM). `onSelect` reçoit la pièce complète. */
export function PartSelect({ placeholder = "Choisir une pièce", onSelect, ...props }: P & { placeholder?: string; onSelect?: (p: Part) => void }) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);
  const list = useApi<Paged<Part>>("/parts", { q: dq || undefined, inStock: true, limit: 30 });
  const options = (list.data?.data ?? []).map((p): ComboOption => ({ value: p.id, label: p.name, description: [p.oemReference, `${p.stockQuantity} en stock`].filter(Boolean).join(" · ") }));
  const onChange = (ev: ChangeEvent<HTMLSelectElement>) => { props.onChange?.(ev); const hit = list.data?.data.find((x) => x.id === ev.target.value); if (hit) onSelect?.(hit); };
  return <Combobox {...props} onChange={onChange} options={options} placeholder={placeholder} searchPlaceholder="Nom, marque, référence OEM…" onSearchChange={setQ} loading={list.isFetching} />;
}
