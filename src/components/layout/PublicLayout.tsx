import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/cn";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { InquiryProvider } from "./InquiryModal";

export const COMPANY = {
  phone: "+221 77 456 78 90",
  email: "contact@3btrading.sn",
  address: "Diamniadio, Dakar, Sénégal",
  hours: "Lun – Sam · 8h – 18h",
};
const NAV = [
  { to: "/", label: "Accueil", end: true },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/services", label: "Services" },
  { to: "/a-propos", label: "À propos" },
];

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand text-white">
      <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-[4vw]">
        <Link to="/">
          <Logo />
        </Link>
        <nav
          className={cn(
            "h-full items-center gap-9 max-lg:absolute max-lg:inset-x-0 max-lg:top-[76px] max-lg:h-auto max-lg:flex-col max-lg:items-stretch max-lg:gap-1 max-lg:bg-brand max-lg:p-5",
            open ? "flex" : "hidden lg:flex",
          )}
        >
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "relative flex h-full items-center text-sm text-[#bdc9c4] transition hover:text-white max-lg:h-11",
                  isActive &&
                    "text-white lg:after:absolute lg:after:inset-x-0 lg:after:bottom-0 lg:after:h-0.5 lg:after:bg-lime",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <Link
            to="/contact"
            className="hidden items-center gap-2 text-sm text-[#d8e0dc] hover:text-white lg:flex"
          >
            <Phone size={16} />
            Nous contacter
          </Link>
          <Link
            to="/admin"
            className="hidden h-[43px] items-center gap-2.5 rounded-[5px] border border-white/30 px-4 text-sm hover:bg-white/10 sm:flex"
          >
            Espace client <ArrowRight size={16} />
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const link = "text-sm text-[#91a19b] hover:text-lime";
  return (
    <footer className="bg-brand-deep px-[5vw] pb-6 pt-16 text-[#c4ceca]">
      <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="grid content-start gap-3">
          <Logo />
          <p className="leading-relaxed text-[#899993]">
            La puissance au service
            <br />
            de vos projets.
          </p>
        </div>
        <div className="grid content-start gap-3">
          <b className="mb-2 text-white">Navigation</b>
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={link}>
              {n.label}
            </Link>
          ))}
        </div>
        <div className="grid content-start gap-3">
          <b className="mb-2 text-white">Nos solutions</b>
          <Link to="/services" className={link}>
            Location d'engins
          </Link>
          <Link to="/catalogue" className={link}>
            Vente de machines
          </Link>
          <Link to="/catalogue?tab=Pièces" className={link}>
            Pièces détachées
          </Link>
          <Link to="/services" className={link}>
            Terrassement
          </Link>
        </div>
        <div className="grid content-start gap-3 text-sm text-[#91a19b]">
          <b className="mb-2 text-white">Contact</b>
          <span>{COMPANY.phone}</span>
          <span>{COMPANY.email}</span>
          <span>{COMPANY.address}</span>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1280px] flex-wrap justify-between gap-2 border-t border-white/10 pt-6 text-xs text-[#71827b]">
        <span>
          © {new Date().getFullYear()} 3B Trading. Tous droits réservés.
        </span>
        <span>Dakar, Sénégal</span>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <InquiryProvider>
      <Header />
      <Outlet />
      <Footer />
    </InquiryProvider>
  );
}
