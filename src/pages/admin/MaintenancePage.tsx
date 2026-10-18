import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerSelect, EquipmentSelect } from "@/components/shared/Selects";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Options, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { api } from "@/lib/api";
import { numOrNull, strOrNull, useForm } from "@/lib/forms";
import { dateFr, fcfa, today } from "@/lib/format";
import { useAction, useApi } from "@/lib/hooks";
import { label, maintenanceKind, maintenanceStatus, maintenanceType, options } from "@/lib/labels";
import type { Maintenance, Paged } from "@/lib/types";

function OrderForm({ onClose }: { onClose: () => void }) {
  const { v, bind } = useForm({ kind: "INTERNE", type: "ENTRETIEN_PERIODIQUE", equipmentId: "", customerId: "", externalMachine: "", scheduledDate: today(), technician: "", estimatedCost: "", description: "" });
  const kind = v.kind as string;
  const save = useAction(
    () => api.post("/maintenance", { kind, type: v.type, equipmentId: kind === "REPARATION_CLIENT" ? null : v.equipmentId || null, customerId: kind === "INTERNE" ? null : v.customerId || null, externalMachine: kind === "REPARATION_CLIENT" ? strOrNull(v.externalMachine as string) : null, scheduledDate: v.scheduledDate, technician: strOrNull(v.technician as string), estimatedCost: numOrNull(v.estimatedCost as string), description: strOrNull(v.description as string) }),
    { success: "Intervention planifiée", onSuccess: onClose },
  );
  const ready = kind === "INTERNE" ? !!v.equipmentId : kind === "SAV" ? !!v.equipmentId && !!v.customerId : !!v.customerId && !!v.externalMachine;
  return (
    <Modal title="Nouvelle intervention" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Annuler</Button><Button disabled={!ready} loading={save.isPending} onClick={() => save.mutate()}>Planifier</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nature"><Select {...bind("kind")}><Options items={options(maintenanceKind)} /></Select></Field>
        <Field label="Type d'intervention"><Select {...bind("type")}><Options items={options(maintenanceType)} /></Select></Field>
        {kind !== "REPARATION_CLIENT" && <Field label={kind === "SAV" ? "Engin vendu" : "Engin de la flotte"}><EquipmentSelect {...bind("equipmentId")} /></Field>}
        {kind !== "INTERNE" && <Field label="Client"><CustomerSelect {...bind("customerId")} /></Field>}
        {kind === "REPARATION_CLIENT" && <Field label="Machine du client"><Input {...bind("externalMachine")} placeholder="Ex. Pelle Hitachi ZX200" /></Field>}
        <Field label="Date prévue"><Input type="date" {...bind("scheduledDate")} /></Field><Field label="Technicien"><Input {...bind("technician")} /></Field>
        <Field label="Coût estimé (FCFA)"><Input type="number" min={0} {...bind("estimatedCost")} /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea {...bind("description")} /></Field>
      </div>
    </Modal>
  );
}

function CompleteModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { v, bind } = useForm({ actualCost: "", meterReading: "" });
  const done = useAction(() => api.post(`/maintenance/${id}/complete`, { actualCost: numOrNull(v.actualCost as string) ?? undefined, meterReading: numOrNull(v.meterReading as string) ?? undefined }), { success: "Intervention terminée", onSuccess: onClose });
  return (
    <Modal size="sm" title="Terminer l'intervention" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Retour</Button><Button loading={done.isPending} onClick={() => done.mutate()}>Terminer</Button></>}>
      <div className="grid gap-4"><Field label="Coût réel (FCFA)"><Input type="number" min={0} {...bind("actualCost")} /></Field><Field label="Relevé compteur (optionnel)"><Input type="number" min={0} {...bind("meterReading")} /></Field></div>
    </Modal>
  );
}

export default function MaintenancePage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);
  const list = useApi<Paged<Maintenance> & { inProgressCount: number; plannedCount: number }>("/maintenance", { status: status || undefined, page, limit: 15 });
  const action = (a: string, ok: string) => useAction((id: string) => api.post(`/maintenance/${id}/${a}`), { success: ok });
  const start = action("start", "Intervention démarrée — engin immobilisé");
  const cancel = action("cancel", "Intervention annulée");
  const tabs = [{ value: "", label: "Toutes" }, ...Object.entries(maintenanceStatus).map(([value, e]) => ({ value, label: e.label }))];

  return (
    <>
      <PageHeader title="Maintenance" subtitle={list.data ? `${list.data.inProgressCount} en cours · ${list.data.plannedCount} planifiée(s)` : "Entretien de la flotte, réparations et SAV."} action={<Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>Nouvelle intervention</Button>} />
      <Card>
        <div className="px-4 pt-3"><Tabs tabs={tabs} value={status} onChange={(v) => { setStatus(v); setPage(1); }} className="border-0" /></div>
        <QueryState q={list} empty={list.data?.data.length === 0}>
          <Table>
            <thead><tr><Th>Référence</Th><Th>Machine</Th><Th>Nature</Th><Th>Date prévue</Th><Th>Coût</Th><Th>Statut</Th><Th /></tr></thead>
            <tbody>
              {list.data?.data.map((m) => (
                <Tr key={m.id}>
                  <Td><div className="grid"><b className="text-ink">{m.reference}</b><small className="text-[11px]">{label(maintenanceType, m.type)}</small></div></Td>
                  <Td>{m.equipment ? `${m.equipment.code} · ${m.equipment.name}` : m.externalMachine}{m.customer && <small className="block text-[11px]">{m.customer.name}</small>}</Td>
                  <Td>{label(maintenanceKind, m.kind)}</Td><Td>{dateFr(m.scheduledDate)}</Td><Td>{m.actualCost != null ? fcfa(m.actualCost) : m.estimatedCost != null ? `~ ${fcfa(m.estimatedCost)}` : "—"}</Td>
                  <Td><StatusBadge map={maintenanceStatus} value={m.status} /></Td>
                  <Td className="text-right"><div className="flex justify-end gap-1.5">
                    {m.status === "PLANIFIEE" && <Button size="sm" onClick={() => start.mutate(m.id)}>Démarrer</Button>}
                    {m.status === "EN_COURS" && <Button size="sm" onClick={() => setCompleting(m.id)}>Terminer</Button>}
                    {(m.status === "PLANIFIEE" || m.status === "EN_COURS") && <Button size="sm" variant="outline" onClick={() => confirm("Annuler cette intervention ?") && cancel.mutate(m.id)}>Annuler</Button>}
                  </div></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </QueryState>
        <Pagination meta={list.data?.meta} onPage={setPage} />
      </Card>
      {creating && <OrderForm onClose={() => setCreating(false)} />}
      {completing && <CompleteModal id={completing} onClose={() => setCompleting(null)} />}
    </>
  );
}
