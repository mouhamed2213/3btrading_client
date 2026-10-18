import { Bell, CalendarDays, ChevronsLeft, ExternalLink, FileText, HardHat, Inbox, LayoutDashboard, LogOut, Menu, Package, Settings, ShieldCheck, Truck, Users, Wrench } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/hooks";
import type { Dashboard } from "@/lib/types";

type Item = { to: string; label: string; icon: ReactNode; end?: boolean; badge?: "reservations" | "inquiries"; admin?: boolean };
const NAV: Item[] = [
  { to: "/admin", label: "Vue d'ensemble", icon: <LayoutDashboard size={19} />, end: true },
  { to: "/admin/reservations", label: "Réservations", icon: <CalendarDays size={19} />, badge: "reservations" },
  { to: "/admin/flotte", label: "Flotte & engins", icon: <Truck size={19} /> },
  { to: "/admin/stock", label: "Catalogue & stock", icon: <Package size={19} /> },
  { to: "/admin/chantiers", label: "Chantiers", icon: <HardHat size={19} /> },
  { to: "/admin/clients", label: "Clients", icon: <Users size={19} /> },
  { to: "/admin/facturation", label: "Facturation", icon: <FileText size={19} /> },
  { to: "/admin/maintenance", label: "Maintenance", icon: <Wrench size={19} /> },
  { to: "/admin/demandes", label: "Demandes du site", icon: <Inbox size={19} />, badge: "inquiries" },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: <ShieldCheck size={19} />, admin: true },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data } = useApi<Dashboard>("/dashboard");
  const badges = { reservations: data?.kpis.pendingReservations ?? 0, inquiries: data?.alerts.newInquiries ?? 0 };
  const items = NAV.filter((i) => !i.admin || user?.role === "ADMIN");
  const current = items.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)))?.label ?? "Espace administrateur";
  const initials = (user?.fullName ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const alerts = (data?.alerts.newInquiries ?? 0) + (data?.alerts.lowStockParts ?? 0);

  return (
    <div className="min-h-screen bg-surface text-[#1b2924]">
      {mobile && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setMobile(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-30 flex flex-col bg-brand-dark text-[#c2cdc9] transition-all", collapsed ? "w-[78px]" : "w-[250px]", mobile ? "translate-x-0" : "max-lg:-translate-x-full")}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Logo compact={collapsed} />
          <button onClick={() => setCollapsed(!collapsed)} className={cn("hidden text-[#b3c1bc] lg:block", collapsed && "hidden")} aria-label="Réduire"><ChevronsLeft size={18} /></button>
        </div>
        {!collapsed && (
          <div className="mx-3.5 my-5 flex items-center gap-2.5 bg-white/5 p-3">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-[5px] bg-lime text-[11px] font-extrabold text-brand">3B</span>
            <div className="grid"><b className="text-xs text-white">3B TRADING</b><small className="text-[10px] text-[#81928c]">{user?.role === "ADMIN" ? "Administrateur" : "Équipe"}</small></div>
          </div>
        )}
        <nav className="grid gap-1 overflow-y-auto px-3">
          {items.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} title={i.label} onClick={() => setMobile(false)}
              className={({ isActive }) => cn("flex h-11 items-center gap-3 whitespace-nowrap rounded-[5px] px-3 text-sm text-[#94a59f] transition hover:bg-white/5 hover:text-white", isActive && "bg-white/5 text-white shadow-[inset_3px_0_#d7ef63]")}>
              {i.icon}
              {!collapsed && <span>{i.label}</span>}
              {!collapsed && i.badge && badges[i.badge] > 0 && <i className="ml-auto rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold not-italic text-brand">{badges[i.badge]}</i>}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto grid gap-1 border-t border-white/10 p-3">
          <button onClick={() => setCollapsed(!collapsed)} className="hidden h-10 items-center gap-3 px-3 text-sm text-[#94a59f] hover:text-white lg:flex"><Settings size={19} />{!collapsed && "Réduire le menu"}</button>
          <NavLink to="/" className="flex h-10 items-center gap-3 px-3 text-sm text-[#94a59f] hover:text-white"><ExternalLink size={19} />{!collapsed && "Voir le site public"}</NavLink>
        </div>
      </aside>

      <div className={cn("transition-all", collapsed ? "lg:ml-[78px]" : "lg:ml-[250px]")}>
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-line bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobile(true)} aria-label="Menu"><Menu /></button>
            <div><small className="text-[9px] font-semibold tracking-[.16em] text-[#84908b]">ESPACE ADMINISTRATEUR</small><h1 className="font-display text-xl font-bold">{current}</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin/demandes")} className="relative grid size-10 place-items-center border border-line bg-white" aria-label="Alertes">
              <Bell size={18} />{alerts > 0 && <i className="absolute right-2 top-2 size-1.5 rounded-full bg-danger" />}
            </button>
            <div className="hidden text-right text-xs sm:block"><b className="block">{user?.fullName}</b><span className="text-muted">{user?.email}</span></div>
            <span className="grid size-10 place-items-center rounded-full bg-brand text-xs font-bold text-white">{initials}</span>
            <button onClick={() => { logout(); navigate("/admin/login"); }} className="grid size-10 place-items-center border border-line text-muted hover:text-danger" aria-label="Se déconnecter" title="Se déconnecter"><LogOut size={18} /></button>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8"><Outlet /></main>
      </div>
    </div>
  );
}
