import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImageManager } from "@/components/shared/ImageManager";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox, Field, Input, Options, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { numOrNull, strOrNull, useForm } from "@/lib/forms";
import { fcfa } from "@/lib/format";
import { useAction, useApi, useDebounced } from "@/lib/hooks";
import { label, options, partFamily } from "@/lib/labels";
import type { Paged, Part } from "@/lib/types";

function PartForm({ item, onClose }: { item?: Part; onClose: () => void }) {
  const { v, bind, check } = useForm({
    name: item?.name ?? "", brand: item?.brand ?? "", family: item?.family ?? "FILTRATION", oemReference: item?.oemReference ?? "", compatibleModels: item?.compatibleModels.join(", ") ?? "",
    condition: item?.condition ?? "NEUF", isOriginal: item?.isOriginal ?? true, price: item ? String(item.price) : "", stockQuantity: String(item?.stockQuantity ?? 0), lowStockThreshold: String(item?.lowStockThreshold ?? 2),
    warrantyMonths: item?.warrantyMonths != null ? String(item.warrantyMonths) : "", description: item?.description ?? "", isPublished: item?.isPublished ?? true,
  });
  const body = () => ({
    name: v.name, brand: v.brand, family: v.family, oemReference: strOrNull(v.oemReference as string), compatibleModels: (v.compatibleModels as string).split(",").map((m) => m.trim()).filter(Boolean),
    condition: v.condition, isOriginal: v.isOriginal, price: Number(v.price), stockQuantity: Number(v.stockQuantity), lowStockThreshold: Number(v.lowStockThreshold),
    warrantyMonths: numOrNull(v.warrantyMonths as string), description: strOrNull(v.description as string), isPublished: v.isPublished,
  });
  const save = useAction(() => (item ? api.patch(`/parts/${item.id}`, body()) : api.post("/parts", body())), { success: item ? "Pièce mise à jour" : "Pièce créée", onSuccess: onClose });
  return (
    <Modal size="lg" title={item ? item.name : "Nouvelle pièce"} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Fermer</Button><Button loading={save.isPending} disabled={!v.name || !v.brand || v.price === ""} onClick={() => save.mutate()}>Enregistrer</Button></>}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Désignation" className="sm:col-span-2"><Input {...bind("name")} /></Field><Field label="Marque"><Input {...bind("brand")} /></Field>
        <Field label="Famille"><Select {...bind("family")}><Options items={options(partFamily)} /></Select></Field>
        <Field label="Référence OEM"><Input {...bind("oemReference")} /></Field>
        <Field label="Garantie (mois)"><Input type="number" min={0} {...bind("warrantyMonths")} /></Field>
        <Field label="Modèles compatibles" hint="Séparés par des virgules : CAT 320D, PC200" className="sm:col-span-3"><Input {...bind("compatibleModels")} /></Field>
        <Field label="État"><Select {...bind("condition")}><option value="NEUF">Neuf</option><option value="OCCASION">Occasion</option></Select></Field>
        <Field label="Prix (FCFA)"><Input type="number" min={0} {...bind("price")} /></Field>
        <Field label="Stock"><Input type="number" min={0} {...bind("stockQuantity")} /></Field>
        <Field label="Seuil d'alerte"><Input type="number" min={0} {...bind("lowStockThreshold")} /></Field>
        <div className="flex items-end gap-6 sm:col-span-2"><Checkbox {...{ ...check("isOriginal"), label: "Pièce d'origine" }} /><Checkbox {...{ ...check("isPublished"), label: "Visible sur le site" }} /></div>
        <Field label="Description" className="sm:col-span-3"><Textarea {...bind("description")} /></Field>
        <div className="sm:col-span-3">{item ? <ImageManager images={item.images} uploadPath={`/parts/${item.id}/images`} /> : <p className="text-xs text-muted">Enregistrez la pièce pour ajouter des photos.</p>}</div>
      </div>
    </Modal>
  );
}

export default function StockPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const lowStock = params.get("low") === "1";
  const q = useDebounced(search);
  const list = useApi<Paged<Part> & { lowStockCount: number }>("/parts", { q: q || undefined, family: family || undefined, lowStock: lowStock || undefined, page, limit: 15 });
  const stock = useAction(({ id, delta }: { id: string; delta: number }) => api.post(`/parts/${id}/stock`, { delta }), { success: "Stock mis à jour" });
  const item = editing && editing !== "new" ? list.data?.data.find((x) => x.id === editing) : undefined;
  const del = useAction((id: string) => api.delete(`/parts/${id}`), { success: "Pièce supprimée" });

  return (
    <>
      <PageHeader title="Catalogue & stock" subtitle="Pièces détachées : références OEM, compatibilités et niveaux de stock." action={<Button icon={<Plus size={16} />} onClick={() => setEditing("new")}>Ajouter une pièce</Button>} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="w-full sm:w-72" placeholder="Nom, marque, référence OEM…" />
          <Select className="w-auto" value={family} onChange={(e) => { setFamily(e.target.value); setPage(1); }}><Options placeholder="Toutes familles" items={options(partFamily)} /></Select>
          <Button variant={lowStock ? "dark" : "outline"} onClick={() => { setParams(lowStock ? {} : { low: "1" }); setPage(1); }}>Stock faible{list.data ? ` (${list.data.lowStockCount})` : ""}</Button>
        </div>
        <QueryState q={list} empty={list.data?.data.length === 0}>
          <Table>
            <thead><tr><Th>Pièce</Th><Th>Famille</Th><Th>Réf. OEM</Th><Th className="text-right">Prix</Th><Th>Stock</Th><Th /></tr></thead>
            <tbody>
              {list.data?.data.map((p) => (
                <Tr key={p.id}>
                  <Td><div className="flex items-center gap-3"><img src={p.images[0]?.url ?? ""} alt="" className="size-11 bg-surface object-cover" /><span className="grid"><b className="text-ink">{p.name}</b><small className="text-[11px]">{p.brand} · {p.condition === "NEUF" ? "Neuf" : "Occasion"}</small></span></div></Td>
                  <Td>{label(partFamily, p.family)}</Td><Td>{p.oemReference ?? "—"}</Td><Td className="text-right">{fcfa(p.price)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button className="grid size-7 place-items-center border border-line hover:bg-surface" aria-label="Sortie de stock" disabled={p.stockQuantity === 0 || stock.isPending} onClick={() => stock.mutate({ id: p.id, delta: -1 })}><Minus size={13} /></button>
                      <b className="w-8 text-center text-ink">{p.stockQuantity}</b>
                      <button className="grid size-7 place-items-center border border-line hover:bg-surface" aria-label="Entrée de stock" disabled={stock.isPending} onClick={() => stock.mutate({ id: p.id, delta: 1 })}><Plus size={13} /></button>
                      {p.stockQuantity <= p.lowStockThreshold && <Badge tone="red">Faible</Badge>}
                    </div>
                  </Td>
                  <Td className="text-right">
                    <button className="p-1.5 text-muted hover:text-ink" onClick={() => setEditing(p.id)} aria-label="Modifier"><Pencil size={15} /></button>
                    {user?.role === "ADMIN" && <button className="p-1.5 text-muted hover:text-danger" aria-label="Supprimer" onClick={() => confirm(`Supprimer « ${p.name} » ?`) && del.mutate(p.id)}><Trash2 size={15} /></button>}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </QueryState>
        <Pagination meta={list.data?.meta} onPage={setPage} />
      </Card>
      {editing === "new" && <PartForm onClose={() => setEditing(null)} />}
      {item && <PartForm key={item.id} item={item} onClose={() => setEditing(null)} />}
    </>
  );
}
