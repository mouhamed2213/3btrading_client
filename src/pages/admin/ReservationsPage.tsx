import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { GenerateInvoice } from "@/features/invoices/GenerateInvoice";
import { ReservationForm } from "@/features/reservations/ReservationForm";
import { api } from "@/lib/api";
import { fcfa, period } from "@/lib/format";
import { useAction, useApi, useDebounced } from "@/lib/hooks";
import { invoiceType, label, reservationStatus } from "@/lib/labels";
import type { Paged, Reservation } from "@/lib/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

type List = Paged<Reservation> & { pendingCount: number };
const TABS = [
  { value: "", label: "Toutes" },
  ...Object.entries(reservationStatus).map(([value, e]) => ({
    value,
    label: e.label,
  })),
];

function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: r } = useApi<Reservation>(`/reservations/${id}`);
  const act = (action: string, ok: string) =>
    useAction(() => api.post(`/reservations/${id}/${action}`), { success: ok });
  const confirm = act("confirm", "Réservation confirmée");
  const start = act("start", "Machine sortie du dépôt");
  const complete = act("complete", "Machine retournée");
  const cancel = act("cancel", "Réservation annulée");
  if (!r) return null;
  const pay = r.payment;

  return (
    <Modal
      title={r.reference}
      subtitle={`${r.customer.name} · ${r.equipment.name}`}
      onClose={onClose}
      size="md"
    >
      <div className="grid gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge map={reservationStatus} value={r.status} />
          <span className="text-muted">{period(r.startDate, r.endDate)}</span>
          {r.siteLocation && (
            <span className="text-muted">· {r.siteLocation}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 border border-line p-4 sm:grid-cols-4">
          {[
            [
              "Tarif",
              `${fcfa(r.unitPrice)} / ${r.pricing === "ROTATION" ? "rotation" : "jour"}`,
            ],
            ["Quantité", String(r.quantity)],
            ["Total HT", fcfa(r.totalAmount)],
            ["Opérateur", r.operatorName ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="grid">
              <small className="text-[10px] uppercase text-muted">{k}</small>
              <b>{v}</b>
            </div>
          ))}
          {r.isDegressive && (
            <p className="col-span-full text-xs font-bold text-olive">
              Tarif dégressif appliqué
            </p>
          )}
        </div>
        {pay && (
          <div
            className={`border p-4 ${pay.canStart ? "border-[#dce9c3] bg-[#f8fbe9]" : "border-[#f3e2b4] bg-[#fffaf0]"}`}
          >
            <b>
              Paiement avant sortie : {fcfa(pay.paid)} / {fcfa(pay.due)} TTC
            </b>
            <p className="mt-1 text-xs text-muted">
              {pay.deferred
                ? "Client partenaire à terme : sortie autorisée sans paiement (facturation fin de mois)."
                : pay.canStart
                  ? "Paiement complet : la machine peut sortir."
                  : `Reste ${fcfa(pay.balance)} à encaisser avant la sortie de machine.`}
            </p>
          </div>
        )}
        {r.invoices && r.invoices.length > 0 && (
          <div className="grid gap-1 text-xs">
            {r.invoices.map((i) => (
              <Link
                to={`/admin/facturation?invoiceId=${i.id}`}
                key={i.id}
                className="flex justify-between border-b border-line py-1.5"
              >
                <b>{i.number}</b>
                <span>
                  {label(invoiceType, i.type)} · {fcfa(i.total)} · {i.status}
                </span>
              </Link>
            ))}
          </div>
        )}
        {!["TERMINEE", "ANNULEE"].includes(r.status) && (
          <GenerateInvoice source={{ kind: "reservation", id }} />
        )}
        <div className="flex flex-wrap gap-2">
          {r.status === "EN_ATTENTE" && (
            <Button
              onClick={() => confirm.mutate()}
              loading={confirm.isPending}
            >
              Confirmer
            </Button>
          )}
          {r.status === "CONFIRMEE" && (
            <Button onClick={() => start.mutate()} loading={start.isPending}>
              Sortir la machine
            </Button>
          )}
          {r.status === "EN_COURS" && (
            <Button
              onClick={() => complete.mutate()}
              loading={complete.isPending}
            >
              Machine retournée
            </Button>
          )}
          {["EN_ATTENTE", "CONFIRMEE"].includes(r.status) && (
            <Button
              variant="danger"
              onClick={() =>
                window.confirm("Annuler cette réservation ?") && cancel.mutate()
              }
              loading={cancel.isPending}
            >
              Annuler
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function ReservationsPage() {
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const q = useDebounced(search);
  const list = useApi<List>("/reservations", {
    status: status || undefined,
    q: q || undefined,
    page,
    limit: 15,
  });
  const creating = params.get("new") === "1";

  return (
    <>
      <PageHeader
        title="Réservations"
        subtitle="Locations d'engins et de camions, de la demande au retour machine."
        action={
          <Button
            icon={<Plus size={16} />}
            onClick={() => setParams({ new: "1" })}
          >
            Nouvelle réservation
          </Button>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Tabs
            tabs={TABS.map((t) => ({
              ...t,
              count:
                t.value === "EN_ATTENTE" ? list.data?.pendingCount : undefined,
            }))}
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
            placeholder="Référence, client, engin…"
          />
        </div>
        <QueryState q={list} empty={list.data?.data.length === 0}>
          <Table>
            <thead>
              <tr>
                <Th>Référence</Th>
                <Th>Client</Th>
                <Th>Engin</Th>
                <Th>Période</Th>
                <Th>Statut</Th>
                <Th className="text-right">Total HT</Th>
              </tr>
            </thead>
            <tbody>
              {list.data?.data.map((r) => (
                <Tr key={r.id} onClick={() => setSelected(r.id)}>
                  <Td>
                    <b className="text-ink">{r.reference}</b>
                  </Td>
                  <Td>{r.customer.name}</Td>
                  <Td>{r.equipment.name}</Td>
                  <Td>{period(r.startDate, r.endDate)}</Td>
                  <Td>
                    <StatusBadge map={reservationStatus} value={r.status} />
                  </Td>
                  <Td className="text-right font-bold text-ink">
                    {fcfa(r.totalAmount)}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </QueryState>
        <Pagination meta={list.data?.meta} onPage={setPage} />
      </Card>
      {creating && <ReservationForm onClose={() => setParams({})} />}
      {selected && <Detail id={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
