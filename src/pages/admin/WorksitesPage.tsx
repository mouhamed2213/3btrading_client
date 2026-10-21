import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerSelect, EquipmentSelect } from "@/components/shared/Selects";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Options, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { GenerateInvoice } from "@/features/invoices/GenerateInvoice";
import { api } from "@/lib/api";
import { dateFr, fcfa, num, today } from "@/lib/format";
import { numOrNull, strOrNull, useForm } from "@/lib/forms";
import { useAction, useApi, useDebounced } from "@/lib/hooks";
import {
  label,
  options,
  workType,
  worksitePricing,
  worksiteStatus,
} from "@/lib/labels";
import type { Paged, Worksite } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const UNIT: Record<string, string> = {
  FORFAIT: "Prix global (FCFA)",
  VOLUME: "Prix par m³ (FCFA)",
  HORAIRE: "Prix par heure (FCFA)",
  JOURNEE: "Prix par jour (FCFA)",
};
const QTY: Record<string, string> = {
  VOLUME: "m³ réalisés",
  HORAIRE: "heures",
  JOURNEE: "jours",
  FORFAIT: "avancement",
};

function WorksiteForm({ onClose }: { onClose: () => void }) {
  const { v, bind } = useForm({
    name: "",
    customerId: "",
    location: "",
    workType: "TERRASSEMENT_MASSE",
    pricing: "VOLUME",
    unitPrice: "",
    estimatedQuantity: "",
    budget: "",
    startDate: today(),
    endDate: "",
    notes: "",
  });
  const save = useAction(
    () =>
      api.post("/worksites", {
        name: v.name,
        customerId: v.customerId,
        location: v.location,
        workType: v.workType,
        pricing: v.pricing,
        unitPrice: Number(v.unitPrice),
        estimatedQuantity:
          v.pricing === "FORFAIT"
            ? null
            : numOrNull(v.estimatedQuantity as string),
        budget: numOrNull(v.budget as string),
        startDate: v.startDate,
        endDate: v.endDate || null,
        notes: strOrNull(v.notes as string),
      }),
    { success: "Chantier créé", onSuccess: onClose },
  );
  return (
    <Modal
      title="Nouveau chantier"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            loading={save.isPending}
            disabled={
              !v.name || !v.customerId || !v.location || v.unitPrice === ""
            }
            onClick={() => save.mutate()}
          >
            Créer
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom du chantier" className="sm:col-span-2">
          <Input
            {...bind("name")}
            placeholder="Terrassement lotissement Diamniadio"
          />
        </Field>
        <Field label="Client">
          <CustomerSelect {...bind("customerId")} />
        </Field>
        <Field label="Lieu">
          <Input {...bind("location")} />
        </Field>
        <Field label="Type de travaux">
          <Select {...bind("workType")}>
            <Options items={options(workType)} />
          </Select>
        </Field>
        <Field label="Tarification">
          <Select {...bind("pricing")}>
            <Options items={options(worksitePricing)} />
          </Select>
        </Field>
        <Field label={UNIT[v.pricing as string] ?? ""}>
          <Input type="number" min={0} {...bind("unitPrice")} />
        </Field>
        {v.pricing !== "FORFAIT" && (
          <Field label={`Quantité estimée (${QTY[v.pricing as string]})`}>
            <Input type="number" min={0} {...bind("estimatedQuantity")} />
          </Field>
        )}
        <Field label="Début">
          <Input type="date" {...bind("startDate")} />
        </Field>
        <Field label="Fin prévue">
          <Input type="date" min={v.startDate as string} {...bind("endDate")} />
        </Field>
        <Field label="Budget client (FCFA)">
          <Input type="number" min={0} {...bind("budget")} />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea {...bind("notes")} />
        </Field>
      </div>
    </Modal>
  );
}

function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: w } = useApi<Worksite>(`/worksites/${id}`);
  const { v, setV, bind } = useForm({
    date: today(),
    quantity: "",
    equipmentId: "",
    notes: "",
  });
  const add = useAction(
    () =>
      api.post(`/worksites/${id}/entries`, {
        date: v.date,
        quantity: Number(v.quantity),
        equipmentId: v.equipmentId || null,
        notes: strOrNull(v.notes as string),
      }),
    {
      success: "Saisie enregistrée",
      onSuccess: () => setV((s) => ({ ...s, quantity: "", notes: "" })),
    },
  );
  const del = useAction(
    (entryId: string) => api.delete(`/worksites/${id}/entries/${entryId}`),
    { success: "Saisie supprimée" },
  );
  const status = useAction(
    (s: string) => api.patch(`/worksites/${id}`, { status: s }),
    { success: "Statut mis à jour" },
  );
  if (!w) return null;
  const p = w.progress;
  const closed = w.status === "TERMINE" || w.status === "ANNULE";

  return (
    <Modal
      size="lg"
      title={`${w.reference} · ${w.name}`}
      subtitle={`${w.customer.name} · ${w.location}`}
      onClose={onClose}
    >
      <div className="grid gap-5 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge map={worksiteStatus} value={w.status} />
          <span className="text-muted">
            {label(workType, w.workType)} · {label(worksitePricing, w.pricing)}{" "}
            · {fcfa(w.unitPrice)}
          </span>
        </div>
        {p && (
          <div className="border border-line p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <span>
                Réalisé :{" "}
                <b>
                  {num(p.totalQuantity)} {p.unit}
                </b>
                {w.estimatedQuantity
                  ? ` / ${num(w.estimatedQuantity)} estimés`
                  : ""}
              </span>
              <b>{fcfa(p.amountToDate)} HT à date</b>
            </div>
            {p.completionPct != null && (
              <div className="mt-3 h-2 bg-surface">
                <div
                  className="h-full bg-brand"
                  style={{ width: `${p.completionPct}%` }}
                />
              </div>
            )}
          </div>
        )}
        {!closed && (
          <div className="grid items-end gap-3 border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
            <Field label="Date">
              <Input type="date" {...bind("date")} />
            </Field>
            <Field
              label={`Quantité (${w.pricing === "VOLUME" ? "m³" : w.pricing === "HORAIRE" ? "h" : "jours"})`}
            >
              <Input type="number" min={0} step="any" {...bind("quantity")} />
            </Field>
            <Field label="Engin utilisé">
              <EquipmentSelect {...bind("equipmentId")} />
            </Field>
            <Button
              disabled={!v.quantity}
              loading={add.isPending}
              onClick={() => add.mutate()}
              icon={<Plus size={16} />}
            >
              Saisir
            </Button>
          </div>
        )}
        <div>
          <h4 className="mb-2 font-display font-bold">Suivi quotidien</h4>
          {w.entries?.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Quantité</Th>
                  <Th>Engin</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {w.entries.map((e) => (
                  <Tr key={e.id}>
                    <Td>{dateFr(e.date)}</Td>
                    <Td>
                      <b className="text-ink">{num(e.quantity)}</b>
                    </Td>
                    <Td>{e.equipment?.name ?? "—"}</Td>
                    <Td className="text-right">
                      <button
                        className="p-1 text-muted hover:text-danger"
                        aria-label="Supprimer"
                        onClick={() =>
                          confirm("Supprimer cette saisie ?") &&
                          del.mutate(e.id)
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-xs text-muted">Aucune saisie pour le moment.</p>
          )}
        </div>
        {w.status !== "ANNULE" && (
          <GenerateInvoice source={{ kind: "worksite", id }} />
        )}
        <div className="flex flex-wrap gap-2">
          {w.status === "PLANIFIE" && (
            <Button onClick={() => status.mutate("EN_COURS")}>
              Démarrer le chantier
            </Button>
          )}
          {w.status === "EN_COURS" && (
            <Button
              onClick={() =>
                confirm("Clôturer ce chantier ?") && status.mutate("TERMINE")
              }
            >
              Terminer le chantier
            </Button>
          )}
          {!closed && (
            <Button
              variant="danger"
              onClick={() =>
                confirm("Annuler ce chantier ?") && status.mutate("ANNULE")
              }
            >
              Annuler
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function WorksitesPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const q = useDebounced(search);
  const list = useApi<Paged<Worksite> & { activeCount: number }>("/worksites", {
    status: status || undefined,
    q: q || undefined,
    page,
    limit: 15,
  });
  const tabs = [
    { value: "", label: "Tous" },
    ...Object.entries(worksiteStatus).map(([value, e]) => ({
      value,
      label: e.label,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Chantiers"
        subtitle={`Prestations de terrassement${list.data ? ` · ${list.data.activeCount} en cours` : ""}`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>
            Nouveau chantier
          </Button>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Tabs
            tabs={tabs}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            className="border-0"
          />
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            className="w-full sm:w-72"
            placeholder="Nom, référence, lieu…"
          />
        </div>
        <QueryState q={list} empty={list.data?.data.length === 0}>
          <Table>
            <thead>
              <tr>
                <Th>Chantier</Th>
                <Th>Client</Th>
                <Th>Type</Th>
                <Th>Tarification</Th>
                <Th>Début</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {list.data?.data.map((w) => (
                <Tr key={w.id} onClick={() => setSelected(w.id)}>
                  <Td>
                    <div className="grid">
                      <b className="text-ink">{w.name}</b>
                      <small className="text-[11px]">
                        {w.reference} · {w.location}
                      </small>
                    </div>
                  </Td>
                  <Td>{w.customer.name}</Td>
                  <Td>{label(workType, w.workType)}</Td>
                  <Td>{label(worksitePricing, w.pricing)}</Td>
                  <Td>{dateFr(w.startDate)}</Td>
                  <Td>
                    <StatusBadge map={worksiteStatus} value={w.status} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </QueryState>
        <Pagination meta={list.data?.meta} onPage={setPage} />
      </Card>
      {creating && <WorksiteForm onClose={() => setCreating(false)} />}
      {selected && <Detail id={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
