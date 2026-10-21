import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { CustomerSelect, EquipmentSelect, PartSelect } from "@/components/shared/Selects";
import { Button } from "@/components/ui/Button";
import { Field, Input, Options, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { useForm, strOrNull } from "@/lib/forms";
import { fcfa } from "@/lib/format";
import { useAction } from "@/lib/hooks";
import { invoiceType, options } from "@/lib/labels";

type Line = { label: string; quantity: string; unitPrice: string; partId?: string; equipmentId?: string };
const TAX = 18;

/** Facture libre (vente de pièces / d'engins, prestations diverses). Réservations et chantiers se facturent depuis leur propre fenêtre. */
export function InvoiceForm({ onClose }: { onClose: () => void }) {
  const due = new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10);
  const { v, bind } = useForm({ type: "PROFORMA", customerId: "", dueDate: due, notes: "" });
  const [lines, setLines] = useState<Line[]>([{ label: "", quantity: "1", unitPrice: "" }]);

  const set = (idx: number, patch: Partial<Line>) => setLines((l) => l.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  const valid = lines.filter((l) => l.label && Number(l.quantity) > 0 && l.unitPrice !== "");
  const subtotal = valid.reduce((s, l) => s + Number(l.quantity) * Number(l.unitPrice), 0);
  const tax = Math.round((subtotal * TAX) / 100);

  const save = useAction(
    () => api.post("/invoices", { type: v.type, customerId: v.customerId, dueDate: v.dueDate, notes: strOrNull(v.notes as string), lines: valid.map((l) => ({ label: l.label, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), partId: l.partId ?? null, equipmentId: l.equipmentId ?? null })) }),
    { success: "Document créé", onSuccess: onClose },
  );

  return (
    <Modal size="lg" title="Nouveau document" subtitle="Les ventes liées au stock s'appliquent à la facture définitive" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Annuler</Button><Button loading={save.isPending} disabled={!v.customerId || valid.length === 0} onClick={() => save.mutate()}>Créer</Button></>}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Type"><Select {...bind("type")}><Options items={options(invoiceType)} /></Select></Field>
        <Field label="Client"><CustomerSelect {...bind("customerId")} /></Field>
        <Field label="Échéance"><Input type="date" {...bind("dueDate")} /></Field>
      </div>

      <div className="mt-5 border border-line">
        <div className="grid grid-cols-[1fr_70px_120px_90px_30px] gap-2 bg-surface px-3 py-2 text-[10px] font-bold uppercase text-muted"><span>Désignation</span><span>Qté</span><span>Prix unit.</span><span className="text-right">Total</span><span /></div>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_70px_120px_90px_30px] items-center gap-2 border-t border-line px-3 py-2">
            <Input value={l.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="Désignation" className="h-9" />
            <Input type="number" min={1} value={l.quantity} disabled={!!l.equipmentId} onChange={(e) => set(i, { quantity: e.target.value })} className="h-9" />
            <Input type="number" min={0} value={l.unitPrice} onChange={(e) => set(i, { unitPrice: e.target.value })} className="h-9" />
            <b className="text-right text-xs">{fcfa(Number(l.quantity) * Number(l.unitPrice || 0))}</b>
            <button onClick={() => setLines((x) => x.filter((_, k) => k !== i))} disabled={lines.length === 1} className="text-danger" aria-label="Retirer"><Trash2 size={15} /></button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 border-t border-line p-3">
          <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => setLines((l) => [...l, { label: "", quantity: "1", unitPrice: "" }])}>Ligne libre</Button>
          <div className="w-60">
            <PartSelect value="" placeholder="+ Pièce du stock" onSelect={(p) => setLines((l) => [...l.filter((x) => x.label || x.unitPrice), { label: `${p.name}${p.oemReference ? ` (${p.oemReference})` : ""}`, quantity: "1", unitPrice: String(p.price), partId: p.id }])} />
          </div>
          <div className="w-60">
            <EquipmentSelect value="" forSaleOnly availableOnly placeholder="+ Engin à vendre" onSelect={(q) => setLines((l) => [...l.filter((x) => x.label || x.unitPrice), { label: `${q.name} (${q.code})`, quantity: "1", unitPrice: String(q.salePrice ?? ""), equipmentId: q.id }])} />
          </div>
        </div>
      </div>

      <div className="ml-auto mt-4 grid w-72 gap-1 text-sm">
        <span className="flex justify-between"><span>Total HT</span><b>{fcfa(subtotal)}</b></span><span className="flex justify-between"><span>TVA {TAX} %</span><b>{fcfa(tax)}</b></span>
        <span className="flex justify-between border-t border-ink pt-2 text-base"><b>Total TTC</b><b className="font-display">{fcfa(subtotal + tax)}</b></span>
      </div>
      <Field label="Notes" className="mt-4"><Textarea {...bind("notes")} /></Field>
    </Modal>
  );
}
