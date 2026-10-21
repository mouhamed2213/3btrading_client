import { ArrowLeft, CalendarDays, FileText, HardHat, Inbox, Mail, MapPin, MessageCircle, Pencil, Phone, Plus, Wallet, Wrench, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, StatCard } from "@/components/ui/Card";
import { Empty, ErrorBox, Spinner } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { CustomerForm } from "@/features/customers/CustomerForm";
import { DataTab, type Column } from "@/features/customers/DataTab";
import { InvoiceDetail } from "@/features/invoices/InvoiceDetail";
import { InvoiceForm } from "@/features/invoices/InvoiceForm";
import { ReceiptModal } from "@/features/invoices/ReceiptModal";
import { ReservationForm } from "@/features/reservations/ReservationForm";
import { cn } from "@/lib/cn";
import { dateFr, dateTimeFr, fcfa, period } from "@/lib/format";
import { useApi } from "@/lib/hooks";
import {
  customerType, inquiryStatus, inquiryType, invoiceStatus, invoiceType, label, maintenanceKind, maintenanceStatus, maintenanceType,
  paymentMethod, reservationStatus, worksiteStatus, workType,
} from "@/lib/labels";
import type { CustomerOverview, Inquiry, Invoice, Maintenance, Payment, Reservation, TimelineEvent, Worksite } from "@/lib/types";

type TabKey = "apercu" | "factures" | "reservations" | "chantiers" | "maintenance" | "paiements" | "demandes";

const EVENT: Record<TimelineEvent["type"], { icon: LucideIcon; tone: string; statuses?: Record<string, { label: string; tone?: never }> | Record<string, { label: string; tone?: string }> }> = {
  RESERVATION: { icon: CalendarDays, tone: "bg-[#edf1fa] text-[#5570b2]", statuses: reservationStatus },
  INVOICE: { icon: FileText, tone: "bg-[#eaf5e9] text-[#2a8057]", statuses: invoiceStatus },
  PAYMENT: { icon: Wallet, tone: "bg-[#f6f0db] text-[#ad8b24]" },
  WORKSITE: { icon: HardHat, tone: "bg-[#f1ece4] text-[#8a6a3b]", statuses: worksiteStatus },
  MAINTENANCE: { icon: Wrench, tone: "bg-[#eef0ef] text-[#5c6a64]", statuses: maintenanceStatus },
  INQUIRY: { icon: Inbox, tone: "bg-[#fae9e6] text-[#bc5c54]", statuses: inquiryStatus },
};

/** WhatsApp attend un numéro international : un numéro sénégalais à 9 chiffres reçoit l'indicatif 221. */
const whatsappUrl = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return `https://wa.me/${d.length === 9 ? `221${d}` : d}`;
};

export default function CustommerDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useApi<CustomerOverview>(`/customers/${id}/overview`);
  const [tab, setTab] = useState<TabKey>("apercu");
  const [modal, setModal] = useState<"edit" | "reservation" | "invoice" | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  if (isLoading) return <Spinner />;
  if (error || !data) return <ErrorBox error={error ?? new Error("Client introuvable")} />;
  const { customer: c, stats: s, timeline } = data;

  /** Clic sur un élément de l'historique : fenêtre sur place quand elle existe, sinon la page du module avec la fiche ouverte. */
  const openEvent = (e: TimelineEvent) => {
    if (e.type === "INVOICE") return setInvoiceId(e.id);
    if (e.type === "PAYMENT") return setReceiptId(e.id);
    const page = { RESERVATION: "reservations", WORKSITE: "chantiers", INQUIRY: "demandes", MAINTENANCE: "maintenance" }[e.type];
    navigate(`/admin/${page}${e.type === "MAINTENANCE" ? "" : `?open=${e.id}`}`);
  };
  const to = (page: string) => (id: string) => navigate(`/admin/${page}?open=${id}`);

  const tabs: { value: TabKey; label: string; count?: number }[] = [
    { value: "apercu", label: "Aperçu" },
    { value: "factures", label: "Factures" },
    { value: "reservations", label: `Réservations${s.reservations.total ? ` (${s.reservations.total})` : ""}` },
    { value: "chantiers", label: `Chantiers${s.worksites.total ? ` (${s.worksites.total})` : ""}` },
    { value: "maintenance", label: `Maintenance${s.maintenance ? ` (${s.maintenance})` : ""}` },
    { value: "paiements", label: "Paiements" },
    { value: "demandes", label: `Demandes${s.inquiries ? ` (${s.inquiries})` : ""}` },
  ];

  const invoiceCols: Column<Invoice>[] = [
    { head: "Document", cell: (i) => <span className="grid"><b className="text-ink">{i.number}</b><small className="text-[11px]">{label(invoiceType, i.type)}</small></span> },
    { head: "Échéance", cell: (i) => dateFr(i.dueDate) },
    { head: "Total TTC", right: true, cell: (i) => <b className="text-ink">{fcfa(i.total)}</b> },
    { head: "Reste dû", right: true, cell: (i) => (i.type === "PROFORMA" ? "—" : fcfa(i.balance)) },
    { head: "Statut", cell: (i) => <div className="flex gap-1"><StatusBadge map={invoiceStatus} value={i.status} />{i.isOverdue && <Badge tone="red">Retard</Badge>}</div> },
  ];
  const reservationCols: Column<Reservation>[] = [
    { head: "Référence", cell: (r) => <b className="text-ink">{r.reference}</b> },
    { head: "Engin", cell: (r) => r.equipment.name },
    { head: "Période", cell: (r) => period(r.startDate, r.endDate) },
    { head: "Statut", cell: (r) => <StatusBadge map={reservationStatus} value={r.status} /> },
    { head: "Total HT", right: true, cell: (r) => <b className="text-ink">{fcfa(r.totalAmount)}</b> },
  ];
  const worksiteCols: Column<Worksite>[] = [
    { head: "Chantier", cell: (w) => <span className="grid"><b className="text-ink">{w.name}</b><small className="text-[11px]">{w.reference}</small></span> },
    { head: "Type", cell: (w) => label(workType, w.workType) },
    { head: "Lieu", cell: (w) => w.location },
    { head: "Début", cell: (w) => dateFr(w.startDate) },
    { head: "Statut", cell: (w) => <StatusBadge map={worksiteStatus} value={w.status} /> },
  ];
  const maintenanceCols: Column<Maintenance>[] = [
    { head: "Référence", cell: (m) => <span className="grid"><b className="text-ink">{m.reference}</b><small className="text-[11px]">{label(maintenanceType, m.type)}</small></span> },
    { head: "Machine", cell: (m) => m.equipment?.name ?? m.externalMachine ?? "—" },
    { head: "Nature", cell: (m) => label(maintenanceKind, m.kind) },
    { head: "Date prévue", cell: (m) => dateFr(m.scheduledDate) },
    { head: "Statut", cell: (m) => <StatusBadge map={maintenanceStatus} value={m.status} /> },
  ];
  const paymentCols: Column<Payment & { invoice: { number: string } }>[] = [
    { head: "Reçu", cell: (p) => <b className="text-ink">{p.receiptNumber}</b> },
    { head: "Facture", cell: (p) => p.invoice.number },
    { head: "Mode", cell: (p) => label(paymentMethod, p.method) },
    { head: "Date", cell: (p) => dateTimeFr(p.paidAt) },
    { head: "Montant", right: true, cell: (p) => <b className="text-ink">{fcfa(p.amount)}</b> },
  ];
  const inquiryCols: Column<Inquiry>[] = [
    { head: "Référence", cell: (q) => <b className="text-ink">{q.reference}</b> },
    { head: "Type", cell: (q) => label(inquiryType, q.type) },
    { head: "Besoin", cell: (q) => q.productLabel ?? (q.message ? `${q.message.slice(0, 50)}${q.message.length > 50 ? "…" : ""}` : "—") },
    { head: "Reçue le", cell: (q) => dateFr(q.createdAt) },
    { head: "Statut", cell: (q) => <StatusBadge map={inquiryStatus} value={q.status} /> },
  ];

  return (
    <>
      <Link to="/admin/clients" className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-ink"><ArrowLeft size={14} />Retour aux clients</Link>

      <Card className="mb-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-bold">{c.name}</h2>
              <Badge tone="blue">{label(customerType, c.type)}</Badge>
              {c.paymentTerms === "A_TERME" ? <Badge tone="green">Paiement à terme</Badge> : <Badge>Comptant</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted">{s.customerSince ? `Client depuis le ${dateFr(s.customerSince)}` : "Aucune activité enregistrée pour le moment"}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#55615c]">
              <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 hover:text-ink"><Phone size={15} />{c.phone}</a>
              <a href={whatsappUrl(c.phone)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink"><MessageCircle size={15} />WhatsApp</a>
              {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-ink"><Mail size={15} />{c.email}</a>}
              {c.address && <span className="flex items-center gap-1.5"><MapPin size={15} />{c.address}</span>}
              {c.ninea && <span>NINEA : <b className="text-ink">{c.ninea}</b></span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" icon={<Pencil size={15} />} onClick={() => setModal("edit")}>Modifier</Button>
            <Button variant="outline" icon={<Plus size={15} />} onClick={() => setModal("invoice")}>Facture</Button>
            <Button icon={<Plus size={15} />} onClick={() => setModal("reservation")}>Réservation</Button>
          </div>
        </div>
        {c.notes && <p className="mt-5 border-l-2 border-lime bg-cream px-3 py-2 text-sm">{c.notes}</p>}
      </Card>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total facturé" icon={<FileText size={18} />} value={fcfa(s.billedTotal)} foot="Acomptes et factures, hors proformas" />
        <StatCard label="Total encaissé" tone="blue" icon={<Wallet size={18} />} value={fcfa(s.paidTotal)} foot={s.billedTotal ? `${Math.round((s.paidTotal / s.billedTotal) * 100)} % du facturé` : "—"} />
        <StatCard label="Reste dû" tone={s.overdueInvoices ? "red" : "amber"} icon={<Wallet size={18} />} value={fcfa(s.outstanding)}
          foot={s.openInvoices ? <><b className={s.overdueInvoices ? "text-danger" : ""}>{s.openInvoices}</b> facture(s) ouverte(s){s.overdueInvoices ? ` · ${s.overdueInvoices} en retard (${fcfa(s.overdueAmount)})` : ""}</> : "Aucune facture ouverte"} />
        <StatCard label="Activité" tone="amber" icon={<CalendarDays size={18} />} value={s.reservations.total + s.worksites.total} foot={`${s.reservations.total} réservation(s) · ${s.worksites.total} chantier(s) · ${s.reservations.active + s.worksites.active} en cours`} />
      </div>

      <Card>
        <div className="px-4 pt-3"><Tabs tabs={tabs} value={tab} onChange={setTab} className="border-0" /></div>
        <div className="pb-2">
          {tab === "apercu" && (
            timeline.length === 0 ? <Empty>Aucune activité pour ce client. Créez une réservation ou une facture pour démarrer son dossier.</Empty> : (
              <ol className="grid gap-0 p-5">
                {timeline.map((e) => {
                  const { icon: Icon, tone, statuses } = EVENT[e.type];
                  return (
                    <li key={`${e.type}-${e.id}`}>
                      <button onClick={() => openEvent(e)} className="flex w-full items-center gap-4 border-b border-[#edf0ed] py-3.5 text-left transition hover:bg-[#fafbf9]">
                        <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", tone)}><Icon size={18} /></span>
                        <span className="grid min-w-0 flex-1"><b className="truncate text-sm text-ink">{e.title}</b><small className="truncate text-[11px] text-muted">{e.reference} · {dateTimeFr(e.date)}</small></span>
                        {e.amount != null && <b className="hidden text-sm text-ink sm:block">{fcfa(e.amount)}</b>}
                        {e.status && statuses && <StatusBadge map={statuses as Record<string, { label: string }>} value={e.status} />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            )
          )}
          {tab === "factures" && <DataTab<Invoice> path="/invoices" customerId={id} columns={invoiceCols} onRow={(i) => setInvoiceId(i.id)} empty="Aucune facture pour ce client." />}
          {tab === "reservations" && <DataTab<Reservation> path="/reservations" customerId={id} columns={reservationCols} onRow={(r) => to("reservations")(r.id)} empty="Aucune réservation pour ce client." />}
          {tab === "chantiers" && <DataTab<Worksite> path="/worksites" customerId={id} columns={worksiteCols} onRow={(w) => to("chantiers")(w.id)} empty="Aucun chantier pour ce client." />}
          {tab === "maintenance" && <DataTab<Maintenance> path="/maintenance" customerId={id} columns={maintenanceCols} onRow={() => navigate("/admin/maintenance")} empty="Aucune intervention (réparation ou SAV) pour ce client." />}
          {tab === "paiements" && <DataTab<Payment & { invoice: { number: string } }> path="/payments" customerId={id} columns={paymentCols} onRow={(p) => setReceiptId(p.id)} empty="Aucun paiement enregistré." />}
          {tab === "demandes" && <DataTab<Inquiry> path="/inquiries" customerId={id} columns={inquiryCols} onRow={(q) => to("demandes")(q.id)} empty="Aucune demande du site rattachée à ce client (rapprochement par téléphone ou email)." />}
        </div>
      </Card>

      {modal === "edit" && <CustomerForm item={c} onClose={() => setModal(null)} />}
      {modal === "reservation" && <ReservationForm customerId={c.id} onClose={() => setModal(null)} />}
      {modal === "invoice" && <InvoiceForm customerId={c.id} onClose={() => setModal(null)} />}
      {invoiceId && <InvoiceDetail id={invoiceId} onClose={() => setInvoiceId(null)} />}
      {receiptId && <ReceiptModal paymentId={receiptId} onClose={() => setReceiptId(null)} />}
    </>
  );
}
