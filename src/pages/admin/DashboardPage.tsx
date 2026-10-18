import { CalendarDays, FileWarning, Inbox, PackageX, TrendingUp, Truck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card, StatCard } from "@/components/ui/Card";
import { Spinner, ErrorBox } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { fcfa, monthLabel, period } from "@/lib/format";
import { useApi } from "@/lib/hooks";
import { reservationStatus } from "@/lib/labels";
import type { Dashboard } from "@/lib/types";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useApi<Dashboard>("/dashboard");
  if (isLoading) return <Spinner />;
  if (error || !data) return <ErrorBox error={error} />;
  const { kpis, fleet, revenueByMonth, recentReservations, alerts } = data;
  const max = Math.max(1, ...revenueByMonth.flatMap((m) => [m.services, m.ventes]));
  const growth = kpis.revenueGrowthPct;
  const pct = (n: number) => (fleet.total ? (n / fleet.total) * 100 : 0);
  const donut = `conic-gradient(#2d805c 0 ${pct(fleet.DISPONIBLE)}%, #5b7fd1 0 ${pct(fleet.DISPONIBLE + fleet.EN_LOCATION)}%, #e6c457 0 100%)`;

  return (
    <>
      <PageHeader title={`Bonjour ${user?.fullName.split(" ")[0] ?? ""} 👋`} subtitle="Voici l'activité de 3B Trading aujourd'hui."
        action={<Link to="/admin/reservations?new=1" className={buttonClass("primary")}><CalendarDays size={16} />Nouvelle réservation</Link>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Encaissements du mois" icon={<TrendingUp size={18} />} value={fcfa(kpis.revenueThisMonth)}
          foot={growth == null ? "Premier mois d'activité" : <><b className={growth >= 0 ? "text-[#278257]" : "text-danger"}>{growth >= 0 ? "+" : ""}{growth}%</b> vs mois dernier</>} />
        <StatCard label="Réservations actives" tone="blue" icon={<CalendarDays size={18} />} value={kpis.activeReservations} foot={`${kpis.pendingReservations} en attente de confirmation`} />
        <StatCard label="Engins disponibles" tone="amber" icon={<Truck size={18} />} value={<>{kpis.availableEquipment} <small className="text-xs font-medium text-muted">/ {kpis.totalEquipment}</small></>} foot={`${fleet.availablePct}% de la flotte`} />
        <StatCard label="Factures impayées" tone="red" icon={<FileWarning size={18} />} value={fcfa(kpis.unpaidAmount)} foot={<><b className={kpis.overdueCount ? "text-danger" : ""}>{kpis.unpaidCount}</b> facture(s) · {kpis.overdueCount} en retard</>} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="p-5">
          <h3 className="font-display text-[15px] font-bold">Encaissements sur 6 mois</h3>
          <div className="mt-5 flex h-48 items-end justify-around gap-2 border-b border-line">
            {revenueByMonth.map((m) => (
              <div key={m.month} className="flex h-full w-full max-w-16 flex-col justify-end text-center">
                <div className="flex flex-1 items-end justify-center gap-1">
                  <i title={`Services : ${fcfa(m.services)}`} className="w-3.5 rounded-t-sm bg-brand" style={{ height: `${(m.services / max) * 100}%`, minHeight: m.services ? 3 : 0 }} />
                  <i title={`Ventes : ${fcfa(m.ventes)}`} className="w-3.5 rounded-t-sm bg-lime" style={{ height: `${(m.ventes / max) * 100}%`, minHeight: m.ventes ? 3 : 0 }} />
                </div>
                <span className="pt-2 text-[10px] capitalize text-[#8e9994]">{monthLabel(m.month)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-6 text-[11px] text-muted">
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-brand" />Locations & chantiers</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-lime" />Ventes</span>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display text-[15px] font-bold">État de la flotte</h3>
          <div className="relative mx-auto mt-5 grid size-32 place-items-center rounded-full" style={{ background: donut }}>
            <div className="absolute size-[82px] rounded-full bg-white" /><div className="z-10 grid text-center"><strong className="font-display text-xl">{fleet.availablePct}%</strong><span className="text-[9px] text-muted">disponible</span></div>
          </div>
          <ul className="mt-5 grid gap-3 text-xs text-muted">
            {[["#2d805c", "Disponibles", fleet.DISPONIBLE], ["#5b7fd1", "En location", fleet.EN_LOCATION], ["#e6c457", "En maintenance", fleet.MAINTENANCE]].map(([c, l, n]) => (
              <li key={String(l)} className="flex items-center gap-2"><i className="size-2 rounded-full" style={{ background: String(c) }} />{l}<b className="ml-auto text-ink">{n}</b></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[
          { to: "/admin/demandes", icon: <Inbox size={18} />, n: alerts.newInquiries, t: "nouvelle(s) demande(s) du site" },
          { to: "/admin/stock?low=1", icon: <PackageX size={18} />, n: alerts.lowStockParts, t: "pièce(s) en stock faible" },
          { to: "/admin/maintenance", icon: <Wrench size={18} />, n: alerts.plannedMaintenance, t: "intervention(s) à planifier" },
        ].map((a) => (
          <Link key={a.t} to={a.to} className="flex items-center gap-3 border border-line bg-white p-4 text-sm hover:border-olive"><span className="grid size-9 place-items-center bg-cream text-brand">{a.icon}</span><b className="font-display text-xl">{a.n}</b><span className="text-muted">{a.t}</span></Link>
        ))}
      </div>

      <Card className="mt-4 pb-2">
        <div className="flex items-center justify-between p-5"><h3 className="font-display text-[15px] font-bold">Dernières réservations</h3><Link to="/admin/reservations"><Button variant="outline" size="sm">Tout voir</Button></Link></div>
        <Table>
          <thead><tr><Th>Référence</Th><Th>Client</Th><Th>Engin</Th><Th>Période</Th><Th>Statut</Th><Th className="text-right">Montant HT</Th></tr></thead>
          <tbody>
            {recentReservations.map((r) => (
              <Tr key={r.id}><Td><b className="text-ink">{r.reference}</b></Td><Td>{r.customer.name}</Td><Td>{r.equipment.name}</Td><Td>{period(r.startDate, r.endDate)}</Td><Td><StatusBadge map={reservationStatus} value={r.status} /></Td><Td className="text-right font-bold text-ink">{fcfa(r.totalAmount)}</Td></Tr>
            ))}
            {recentReservations.length === 0 && <tr><Td colSpan={6} className="py-10 text-center">Aucune réservation pour le moment.</Td></tr>}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
