import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Options, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { api } from "@/lib/api";
import { dateFr, dateTimeFr } from "@/lib/format";
import { useAction, useApi } from "@/lib/hooks";
import { inquiryStatus, inquiryType, label, options } from "@/lib/labels";
import type { Inquiry, Paged } from "@/lib/types";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

function Detail({ item, onClose }: { item: Inquiry; onClose: () => void }) {
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.internalNote ?? "");
  const save = useAction(
    () =>
      api.patch(`/inquiries/${item.id}`, {
        status,
        internalNote: note || null,
      }),
    { success: "Demande mise à jour", onSuccess: onClose },
  );
  const dur: Record<string, string> = {
    "1-3": "1 à 3 jours",
    "4-7": "4 à 7 jours",
    "7+": "plus de 7 jours",
  };
  return (
    <Modal
      title={`${item.reference} · ${item.name}`}
      subtitle={`${label(inquiryType, item.type)} · reçue le ${dateTimeFr(item.createdAt)}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="grid gap-4 text-sm">
        <div className="flex flex-wrap gap-4 text-muted">
          <a
            href={`tel:${item.phone}`}
            className="flex items-center gap-1.5 hover:text-ink"
          >
            <Phone size={15} />
            {item.phone}
          </a>
          {item.email && (
            <a
              href={`mailto:${item.email}`}
              className="flex items-center gap-1.5 hover:text-ink"
            >
              <Mail size={15} />
              {item.email}
            </a>
          )}
          {item.siteLocation && (
            <span className="flex items-center gap-1.5">
              <MapPin size={15} />
              {item.siteLocation}
            </span>
          )}
        </div>
        {item.productLabel && (
          <p className="border-l-2 border-lime bg-cream px-3 py-2">
            Produit : <b>{item.productLabel}</b>
          </p>
        )}
        {(item.desiredStartDate || item.durationRange) && (
          <p className="text-muted">
            Souhaité :{" "}
            {item.desiredStartDate
              ? dateFr(item.desiredStartDate)
              : "date à préciser"}
            {item.durationRange
              ? ` · ${dur[item.durationRange] ?? item.durationRange}`
              : ""}
          </p>
        )}
        {item.message && (
          <p className="whitespace-pre-wrap border border-line p-3">
            {item.message}
          </p>
        )}
        <Field label="Statut">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as Inquiry["status"])}
          >
            <Options items={options(inquiryStatus)} />
          </Select>
        </Field>
        <Field label="Note interne">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

export default function InquiriesPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const list = useApi<Paged<Inquiry> & { newCount: number }>("/inquiries", {
    status: status || undefined,
    page,
    limit: 15,
  });
  const item = list.data?.data.find((i) => i.id === selected);
  const tabs = [
    { value: "", label: "Toutes" },
    ...Object.entries(inquiryStatus).map(([value, e]) => ({
      value,
      label: e.label,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Demandes du site"
        subtitle="Réservations, devis et messages reçus depuis le site public."
      />
      <Card>
        <div className="px-4 pt-3">
          <Tabs
            tabs={tabs.map((t) => ({
              ...t,
              count: t.value === "NOUVELLE" ? list.data?.newCount : undefined,
            }))}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            className="border-0"
          />
        </div>
        <QueryState q={list} empty={list.data?.data.length === 0}>
          <Table>
            <thead>
              <tr>
                <Th>Référence</Th>
                <Th>Contact</Th>
                <Th>Type</Th>
                <Th>Produit / besoin</Th>
                <Th>Reçue le</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {list.data?.data.map((i) => (
                <Tr key={i.id} onClick={() => setSelected(i.id)}>
                  <Td>
                    <b className="text-ink">{i.reference}</b>
                  </Td>
                  <Td>
                    <div className="grid">
                      <b className="text-ink">{i.name}</b>
                      <small className="text-[11px]">{i.phone}</small>
                    </div>
                  </Td>
                  <Td>{label(inquiryType, i.type)}</Td>
                  <Td>
                    {i.productLabel ??
                      (i.message
                        ? `${i.message.slice(0, 40)}${i.message.length > 40 ? "…" : ""}`
                        : "—")}
                  </Td>
                  <Td>{dateFr(i.createdAt)}</Td>
                  <Td>
                    <StatusBadge map={inquiryStatus} value={i.status} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </QueryState>
        <Pagination meta={list.data?.meta} onPage={setPage} />
      </Card>
      {item && (
        <Detail key={item.id} item={item} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
