import { useInquiry } from "@/components/layout/InquiryModal";
import { COMPANY } from "@/components/layout/PublicLayout";
import { Eyebrow } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/Button";
import { ErrorBox, Spinner } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { fcfa, num } from "@/lib/format";
import { useApi } from "@/lib/hooks";
import { label, partFamily } from "@/lib/labels";
import type { PublicEquipment, PublicPart } from "@/lib/types";
import { ArrowRight, Phone, Settings, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IMG } from "./content";

type Spec = [string, string];

export default function ProductDetailPage() {
  const { kind, id } = useParams();
  const isPart = kind === "pieces";
  const eq = useApi<PublicEquipment>(`/public/equipment/${id}`, undefined, {
    enabled: !isPart,
  });
  const part = useApi<PublicPart>(`/public/parts/${id}`, undefined, {
    enabled: isPart,
  });
  const q = isPart ? part : eq;
  const inquiry = useInquiry();
  const [index, setIndex] = useState(0);

  if (q.isLoading) return <Spinner />;
  if (q.error || !q.data)
    return (
      <div className="mx-auto max-w-xl py-20">
        <ErrorBox error={q.error ?? new Error("Produit introuvable")} />
        <Link to="/catalogue" className="block text-center underline">
          Retour au catalogue
        </Link>
      </div>
    );

  const e = isPart ? null : (q.data as PublicEquipment);
  const p = isPart ? (q.data as PublicPart) : null;
  const name = (e ?? p)!.name;
  const brand = (e ?? p)!.brand;
  const images = (e ?? p)!.images.length ? (e ?? p)!.images : [IMG.placeholder];
  const tag = e ? e.group : "Pièces";
  const status = e
    ? e.statusLabel
    : p!.inStock
      ? p!.stockQuantity <= 5
        ? `${num(p!.stockQuantity)} en stock`
        : "En stock"
      : "Sur commande";
  const price = e ? e.salePrice : p!.price;

  const specs: Spec[] = e
    ? (
        [
          ["Année", e.year ? String(e.year) : ""],
          ["Compteur", e.meta.split(" • ").pop() ?? ""],
          ["Puissance", e.powerHp ? `${e.powerHp} ch` : ""],
          ["Modèle", e.model ?? ""],
          ["Localisation", e.location],
          ["Disponibilité", e.statusLabel],
        ] as Spec[]
      ).filter(([, v]) => v)
    : (
        [
          ["Référence OEM", p!.oemReference ?? ""],
          ["Famille", label(partFamily, p!.family)],
          ["État", p!.condition === "NEUF" ? "Neuf" : "Occasion"],
          ["Origine", p!.isOriginal ? "Pièce d'origine" : "Compatible"],
          ["Compatibilité", p!.compatibleModels.join(", ")],
          ["Garantie", p!.warrantyMonths ? `${p!.warrantyMonths} mois` : ""],
        ] as Spec[]
      ).filter(([, v]) => v);

  const ask = () =>
    inquiry({
      type: isPart ? "PIECE" : "ACHAT",
      productLabel: name,
      ...(e ? { equipmentId: e.id } : { partId: p!.id }),
    });

  return (
    <main className="bg-[#f7f8f5] pb-24">
      <div className="mx-auto flex max-w-[1280px] justify-between px-4 py-6 text-[11px] text-[#8b9591] sm:px-8">
        <Link
          to="/catalogue"
          className="flex items-center gap-2 font-bold text-ink"
        >
          <ArrowRight size={15} className="rotate-180" />
          Retour au catalogue
        </Link>
        <span className="max-sm:hidden">
          Catalogue / {tag} / <b>{name}</b>
        </span>
      </div>

      <section className="mx-auto grid max-w-[1280px] gap-12 px-4 pb-16 sm:px-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-16">
        <div>
          <div className="relative h-[380px] overflow-hidden bg-[#e2e6e1] sm:h-[560px]">
            <img
              key={images[index]}
              src={images[index]}
              alt={name}
              className="size-full animate-fade-up object-cover"
            />
            <span className="absolute left-5 top-5 bg-lime px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-brand">
              {status}
            </span>
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {images.slice(0, 6).map((src, i) => (
                <button
                  key={src}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-[85px] overflow-hidden border-2 bg-[#e2e6e1] sm:h-[105px]",
                    i === index
                      ? "border-brand"
                      : "border-transparent opacity-60",
                  )}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-olive">
            {tag} • {brand}
          </div>
          <h1 className="my-3 font-display text-[clamp(34px,4vw,54px)] font-bold leading-[1.08] tracking-[-.05em]">
            {name}
          </h1>
          {e && (
            <p className="text-[11px] text-[#919b97]">Référence {e.code}</p>
          )}
          <div className="my-7 grid border-y border-line py-6">
            <small className="text-[10px] text-[#87918d]">
              {price != null ? "Prix indicatif" : "Prix"}
            </small>
            <strong className="my-1 font-display text-3xl">
              {price != null ? fcfa(price) : "Sur demande"}
            </strong>
            <span className="text-[10px] text-[#9aa39f]">
              Prix hors frais de transport
            </span>
          </div>
          {e?.rental && (
            <div className="mb-6 border border-line bg-white p-4 text-sm">
              <b className="font-display">
                Disponible à la location · clé en main
              </b>
              <p className="mt-1 text-xs text-muted">
                Opérateur et carburant inclus.
                {e.rental.dailyRate ? ` ${fcfa(e.rental.dailyRate)}/jour` : ""}
                {e.rental.rotationRate
                  ? ` · ${fcfa(e.rental.rotationRate)}/rotation`
                  : ""}
                {e.rental.degressiveDailyRate
                  ? ` · ${fcfa(e.rental.degressiveDailyRate)}/jour dès ${e.rental.degressiveFromDays} jours`
                  : ""}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  inquiry({
                    type: "LOCATION",
                    productLabel: name,
                    equipmentId: e.id,
                  })
                }
              >
                Louer cette machine
              </Button>
            </div>
          )}
          <div className="mb-6 grid gap-3.5 sm:grid-cols-2">
            {[
              [
                <ShieldCheck key="s" />,
                "Inspecté par nos experts",
                "Contrôle complet 3B Trading",
              ],
              [
                <Settings key="g" />,
                "Prêt à travailler",
                "Entretien et essais réalisés",
              ],
            ].map(([icon, t, s]) => (
              <div
                key={String(t)}
                className="flex items-center gap-2.5 border border-line bg-white p-3.5 text-olive"
              >
                {icon}
                <span className="grid text-ink">
                  <b className="text-[11px]">{t}</b>
                  <small className="mt-0.5 text-[9px] text-[#8a9490]">
                    {s}
                  </small>
                </span>
              </div>
            ))}
          </div>
          <Button size="lg" className="w-full" onClick={ask}>
            Demander une offre <ArrowRight size={18} />
          </Button>
          <a
            href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
            className="flex items-center justify-center gap-2 py-4 text-xs text-[#65706c]"
          >
            <Phone size={15} />
            Parler à un conseiller : <b>{COMPANY.phone}</b>
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-12 bg-white p-8 sm:p-14 lg:grid-cols-[1.2fr_.8fr] lg:gap-24">
        <article>
          <Eyebrow>Présentation</Eyebrow>
          <h2 className="mb-4 font-display text-3xl font-bold tracking-tight">
            À propos de cet équipement
          </h2>
          <p className="text-sm leading-7 text-muted">
            {(e ?? p)!.description ||
              `${name} sélectionné par 3B Trading pour sa fiabilité et son excellent potentiel d'exploitation. Notre équipe commerciale vous accompagne sur la documentation, la visite et la livraison.`}
          </p>
        </article>
        <article className="lg:border-l lg:border-line lg:pl-14">
          <h3 className="mb-5 font-display text-[17px] font-bold">
            Caractéristiques principales
          </h3>
          {specs.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between gap-4 border-b border-line py-3.5 text-xs"
            >
              <span className="text-[#7d8883]">{k}</span>
              <b className="text-right">{v}</b>
            </div>
          ))}
        </article>
      </section>

      <section className="mx-auto mt-5 flex max-w-[1220px] flex-wrap items-center justify-between gap-5 bg-brand px-8 py-7 text-white sm:px-10">
        <div className="flex items-center gap-4">
          <ShieldCheck size={30} className="text-lime" />
          <span className="grid">
            <b className="font-display text-base">
              Achetez en toute confiance.
            </b>
            <small className="mt-1 text-[#aab9b4]">
              Inspection, documentation et accompagnement assurés par 3B
              Trading.
            </small>
          </span>
        </div>
        <Button variant="glass" onClick={ask}>
          Planifier une visite <ArrowRight size={16} />
        </Button>
      </section>
    </main>
  );
}
