import { useInquiry } from "@/components/layout/InquiryModal";
import { Eyebrow } from "@/components/shared/PageHero";
import { Button, buttonClass } from "@/components/ui/Button";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Settings,
  Truck,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BRANDS, IMG } from "./content";

const SERVICES = [
  [
    "01",
    "Terrassement & travaux",
    "Terrassement de masse, nivellement, fouilles, assainissement et fondations.",
    <Wrench key="a" size={22} />,
  ],
  [
    "02",
    "Location d'engins",
    "Une flotte récente avec opérateur et carburant inclus pour une maîtrise totale.",
    <CalendarDays key="b" size={22} />,
  ],
  [
    "03",
    "Vente d'engins & camions",
    "Une sélection contrôlée de machines toutes marques, prêtes à travailler.",
    <Truck key="c" size={22} />,
  ],
  [
    "04",
    "Pièces détachées",
    "Pièces d'origine et compatibles, recherche par référence OEM et par modèle.",
    <Settings key="d" size={22} />,
  ],
] as const;

export default function HomePage() {
  const inquiry = useInquiry();
  return (
    <main>
      <section className="relative h-[calc(100vh-76px)] min-h-[650px] overflow-hidden text-white max-sm:h-[790px]">
        <img
          src={IMG.hero}
          alt="Engin de chantier en opération"
          className="size-full animate-hero-zoom object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#102a23ef_0%,#102a23bc_45%,#102a2340_75%),linear-gradient(0deg,#0b241bb5_0%,transparent_45%)]" />
        <div className="absolute left-[max(5vw,calc((100vw-1380px)/2))] right-6 top-[46%] max-w-[760px] -translate-y-1/2 max-sm:left-6">
          <Eyebrow light>Expertise BTP au Sénégal</Eyebrow>
          <h1 className="font-display text-[clamp(44px,6vw,86px)] font-semibold leading-[.99] tracking-[-.055em]">
            La puissance qui
            <br />
            fait avancer <em className="not-italic text-lime">vos projets.</em>
          </h1>
          <p className="my-7 max-w-[630px] text-lg leading-relaxed text-[#d8e0dc] max-sm:text-[15px]">
            Engins, camions, pièces détachées et prestations de terrassement.
            Une expertise terrain au service de vos ambitions.
          </p>
          <div className="flex gap-3 max-sm:flex-col">
            <Link to="/catalogue" className={buttonClass("primary", "lg")}>
              Découvrir notre catalogue <ArrowRight size={18} />
            </Link>
            <Button
              variant="glass"
              size="lg"
              icon={<CalendarDays size={18} />}
              onClick={() => inquiry({ type: "LOCATION" })}
            >
              Réserver un engin
            </Button>
          </div>
        </div>
    
      </section>

      <section className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-6 border-b border-line px-[5vw] py-8 text-[#a6aca9]">
        <span className="text-xs uppercase tracking-[.11em] text-[#7f8984]">
          Des marques reconnues, sélectionnées pour leur fiabilité
        </span>
        {BRANDS.map((b) => (
          <b
            key={b}
            className="font-display text-[17px] tracking-wide max-md:text-xs"
          >
            {b}
          </b>
        ))}
      </section>

      <section className="mx-auto max-w-[1380px] px-[5vw] py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
          <div>
            <Eyebrow>Notre expertise</Eyebrow>
            <h2 className="font-display text-[clamp(34px,4vw,58px)] font-semibold leading-[1.07] tracking-[-.045em]">
              Une solution complète,
              <br />
              <em className="not-italic text-[#8c9791]">
                du terrain à la machine.
              </em>
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-muted">
            Nous accompagnons chaque projet avec une flotte performante, des
            équipes expérimentées et des solutions adaptées à vos contraintes.
          </p>
        </div>
        <div className="grid border border-line md:grid-cols-2 xl:grid-cols-4">
          {SERVICES.map(([num, title, text, icon]) => (
            <article
              key={title}
              className="group flex min-h-[330px] flex-col border-b border-r border-line bg-white p-8 transition duration-300 hover:-translate-y-2 hover:bg-brand hover:text-white hover:shadow-2xl"
            >
              <div className="flex justify-between text-xs text-[#a0a9a4]">
                <span>{num}</span>
                <span className="grid size-12 place-items-center rounded-full bg-cream text-brand group-hover:bg-lime">
                  {icon}
                </span>
              </div>
              <h3 className="mb-3.5 mt-14 font-display text-[21px] font-bold">
                {title}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-muted group-hover:text-[#bdc8c3]">
                {text}
              </p>
              <Link
                to="/services"
                className="mt-auto flex items-center gap-2.5 text-[13px] font-semibold"
              >
                En savoir plus <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid min-h-[700px] bg-[#122f27] text-white lg:grid-cols-[45%_55%]">
        <div className="px-[max(5vw,calc((100vw-1380px)/2))] py-24 max-sm:px-6">
          <Eyebrow light>Location clé en main</Eyebrow>
          <h2 className="font-display text-[clamp(34px,4vw,58px)] font-semibold leading-[1.07] tracking-[-.045em]">
            Concentrez-vous
            <br />
            sur le chantier.
            <br />
            <em className="not-italic text-[#8c9791]">On gère le reste.</em>
          </h2>
          <p className="my-7 max-w-[480px] leading-relaxed text-[#b8c5c0]">
            Chaque location inclut un opérateur qualifié et le carburant. Vous
            bénéficiez d'une machine performante, suivie et prête à produire.
          </p>
          <ul className="mb-8 grid gap-3 text-[#d6dedb]">
            {[
              "Opérateur expérimenté inclus",
              "Maintenance et assistance terrain",
              "Tarifs dégressifs dès 7 jours",
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check size={20} className="text-lime" />
                {t}
              </li>
            ))}
          </ul>
          <Button size="lg" onClick={() => inquiry({ type: "LOCATION" })}>
            Demander une disponibilité <ArrowRight size={18} />
          </Button>
        </div>
        <div className="relative min-h-[400px] overflow-hidden">
          <img
            src={IMG.showcase}
            alt="Engin lourd sur chantier"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute bottom-9 left-9 grid min-w-[260px] bg-white py-4 pl-11 pr-6 text-ink">
            <span className="absolute left-5 top-6 size-2.5 rounded-full bg-[#38a36f] shadow-[0_0_0_5px_#38a36f20]" />
            <b>Disponible maintenant</b>
            <small className="mt-0.5 text-muted">CAT 320D • Dakar</small>
          </div>
        </div>
      </section>
    </main>
  );
}
