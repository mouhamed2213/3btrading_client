import { PageHeader } from "@/components/shared/PageHeader";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { InvoiceDetail } from "@/features/invoices/InvoiceDetail";
import { InvoiceForm } from "@/features/invoices/InvoiceForm";
import { cn } from "@/lib/cn";
import { dateFr, fcfa } from "@/lib/format";
import { useApi, useDebounced } from "@/lib/hooks";
import { invoiceStatus, invoiceType, label } from "@/lib/labels";
import type { Invoice, Paged } from "@/lib/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type Summary = {
  billedThisMonth: number;
  collectedThisMonth: number;
  unpaidAmount: number;
  unpaidCount: number;
  overdueCount: number;
};
const TABS = [
  { value: "", label: "Tous" },
  { value: "PROFORMA", label: "Proformas" },
  { value: "ACOMPTE", label: "Acomptes" },
  { value: "DEFINITIVE", label: "Factures" },
  { value: "unpaid", label: "Impayées" },
];

export default function BillingPage() {
  const [tab, setTab] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const q = useDebounced(search);
  const summary = useApi<Summary>("/invoices/summary");
  const list = useApi<Paged<Invoice>>("/invoices", {
    type: tab && tab !== "unpaid" ? tab : undefined,
    unpaid: tab === "unpaid" || undefined,
    q: q || undefined,
    page,
    limit: 15,
  });
  const s = summary.data;

  const invoiceId = searchParams.get("invoiceId"); // lu directement, pas besoin d'effet

  useEffect(() => {
    if (invoiceId) setSelected(invoiceId);
  }, [invoiceId]);

  console.log(invoiceId)

  return (
    <>
      <PageHeader
        title="Facturation"
        subtitle="Proformas, acomptes, factures définitives, encaissements et relances."
        action={
          <Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>
            Nouveau document
          </Button>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          ["Facturé ce mois", s?.billedThisMonth, ""],
          ["Encaissé ce mois", s?.collectedThisMonth, ""],
          ["Solde impayé", s?.unpaidAmount, "border-l-[3px] border-l-danger"],
        ].map(([l, n, c]) => (
          <Card key={String(l)} className={cn("grid p-5", String(c))}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              {l}
            </span>
            <b className="mt-2 font-display text-xl">
              {s ? fcfa(Number(n)) : "…"}
            </b>
            {l === "Solde impayé" && s && (
              <small className="mt-1 text-xs text-muted">
                {s.unpaidCount} facture(s) · {s.overdueCount} en retard
              </small>
            )}
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
          <Tabs
            tabs={TABS.map((t) => ({
              ...t,
              count: t.value === "unpaid" ? s?.overdueCount : undefined,
            }))}
            value={tab}
            onChange={(v) => {
              setTab(v);
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
            placeholder="N° de facture, client…"
          />
        </div>
        <QueryState q={list} empty={list.data?.data.length === 0}>
          <Table>
            <thead>
              <tr>
                <Th>Document</Th>
                <Th>Client</Th>
                <Th>Échéance</Th>
                <Th className="text-right">Total TTC</Th>
                <Th className="text-right">Reste dû</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {list.data?.data.map((i) => (
                <Tr key={i.id} onClick={() => setSelected(i.id)}>
                  <Td>
                    <div className="grid">
                      <b className="text-ink">{i.number}</b>
                      <small className="text-[11px]">
                        {label(invoiceType, i.type)}
                      </small>
                    </div>
                  </Td>
                  <Td>{i.customer.name}</Td>
                  <Td>{dateFr(i.dueDate)}</Td>
                  <Td className="text-right font-bold text-ink">
                    {fcfa(i.total)}
                  </Td>
                  <Td className="text-right">
                    {i.type === "PROFORMA" ? "—" : fcfa(i.balance)}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge map={invoiceStatus} value={i.status} />
                      {i.isOverdue && <Badge tone="red">Retard</Badge>}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </QueryState>
        <Pagination meta={list.data?.meta} onPage={setPage} />
      </Card>
      {creating && <InvoiceForm onClose={() => setCreating(false)} />}
      {selected && (
        <InvoiceDetail id={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
