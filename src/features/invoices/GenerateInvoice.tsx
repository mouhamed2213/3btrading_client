import { FilePlus2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { api } from "@/lib/api";
import { useAction } from "@/lib/hooks";
import { invoiceType, options } from "@/lib/labels";
import type { Invoice } from "@/lib/types";

/** Génère une proforma, un acompte ou la facture définitive depuis une réservation / un chantier (lignes et déductions calculées par l'API). */
export function GenerateInvoice({ source }: { source: { kind: "reservation" | "worksite"; id: string } }) {
  const [type, setType] = useState("PROFORMA");
  const [amount, setAmount] = useState("");
  const create = useAction(
    () => api.post<Invoice>(`/invoices/from-${source.kind}`, { [`${source.kind}Id`]: source.id, type, amount: type === "ACOMPTE" && amount ? Number(amount) : undefined }),
    { success: "Document créé — retrouvez-le dans Facturation" },
  );
  return (
    <div className="grid items-end gap-3 border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_auto]">
      <Field label="Document à générer"><Select value={type} onChange={(e) => setType(e.target.value)}>{options(invoiceType).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></Field>
      {type === "ACOMPTE" ? <Field label="Montant HT de l'acompte" hint={source.kind === "reservation" ? "Vide = 100 % de la location" : undefined}><Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field> : <span />}
      <Button onClick={() => create.mutate()} loading={create.isPending} icon={<FilePlus2 size={16} />}>Générer</Button>
    </div>
  );
}
