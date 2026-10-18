import type { SelectHTMLAttributes } from "react";
import { Select } from "@/components/ui/Field";
import { useApi } from "@/lib/hooks";
import type { Customer, Equipment, Paged } from "@/lib/types";

type P = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children">;

export function CustomerSelect(props: P) {
  const { data } = useApi<Paged<Customer>>("/customers", { limit: 100 });
  return <Select {...props}><option value="">— Choisir un client —</option>{data?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>;
}

export function EquipmentSelect({ rentableOnly, ...props }: P & { rentableOnly?: boolean }) {
  const { data } = useApi<Paged<Equipment>>("/equipment", { limit: 100, isRentable: rentableOnly ? true : undefined });
  return (
    <Select {...props}>
      <option value="">— Choisir un engin —</option>
      {data?.data.filter((e) => e.status !== "VENDU").map((e) => <option key={e.id} value={e.id}>{e.code} · {e.name}</option>)}
    </Select>
  );
}
