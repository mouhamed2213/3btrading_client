import { PageHero } from "@/components/shared/PageHero";
import { SearchInput } from "@/components/ui/SearchInput";
import { Empty, ErrorBox, Spinner } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { fcfa, num } from "@/lib/format";
import { useApi, useDebounced } from "@/lib/hooks";
import type { Paged, PublicEquipment, PublicPart } from "@/lib/types";
import { ArrowRight, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { IMG } from "./content";

const TABS = ["Tous", "Engins", "Camions", "Pièces"] as const;
type Tab = (typeof TABS)[number];

type Card = {
  key: string;
  to: string;
  tag: string;
  name: string;
  brand: string;
  meta: string;
  price: number | null;
  status: string;
  image: string;
};

const fromEquipment = (e: PublicEquipment): Card => ({
  key: `e-${e.id}`,
  to: `/catalogue/engins/${e.id}`,
  tag: e.group,
  name: e.name,
  brand: e.brand,
  meta: e.meta,
  price: e.salePrice,
  status: e.statusLabel,
  image: e.images[0] ?? IMG.placeholder,
});
const fromPart = (p: PublicPart): Card => ({
  key: `p-${p.id}`,
  to: `/catalogue/pieces/${p.id}`,
  tag: "Pièces",
  name: p.name,
  brand: p.brand,
  meta: [
    p.oemReference && `Réf. ${p.oemReference}`,
    p.condition === "NEUF" ? "Neuf" : "Occasion",
  ]
    .filter(Boolean)
    .join(" • "),
  price: p.price,
  status: !p.inStock
    ? "Sur commande"
    : p.stockQuantity <= 5
      ? `${num(p.stockQuantity)} en stock`
      : "En stock",
  image: p.images[0] ?? IMG.placeholder,
});

function useFavorites() {
  const [ids, setIds] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("3bt_favs") ?? "[]"),
  );
  useEffect(() => {
    localStorage.setItem("3bt_favs", JSON.stringify(ids));
  }, [ids]);
  return [
    ids,
    (id: string) =>
      setIds((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id])),
  ] as const;
}

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t === params.get("tab")) ?? "Tous") as Tab;
  const [brand, setBrand] = useState("");
  const [search, setSearch] = useState("");
  const q = useDebounced(search);
  const [favs, toggleFav] = useFavorites();

  const wantEq = tab !== "Pièces";
  const wantParts = tab === "Tous" || tab === "Pièces";
  const common = { q: q || undefined, brand: brand || undefined, limit: 50 };
  const equipment = useApi<Paged<PublicEquipment>>(
    "/public/equipment",
    {
      ...common,
      group: tab === "Engins" || tab === "Camions" ? tab : undefined,
    },
    { enabled: wantEq },
  );
  const parts = useApi<Paged<PublicPart>>("/public/parts", common, {
    enabled: wantParts,
  });
  const brands = useApi<string[]>("/public/brands");

  const cards = useMemo(
    () => [
      ...(wantEq ? (equipment.data?.data.map(fromEquipment) ?? []) : []),
      ...(wantParts ? (parts.data?.data.map(fromPart) ?? []) : []),
    ],
    [wantEq, wantParts, equipment.data, parts.data],
  );
  const loading =
    (wantEq && equipment.isLoading) || (wantParts && parts.isLoading);
  const error = (wantEq && equipment.error) || (wantParts && parts.error);

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      <PageHero
        eyebrow="Notre catalogue"
        title={
          <>
            Des machines fiables.
            <br />
            <em>Des projets sans limites.</em>
          </>
        }
      >
        Explorez notre sélection d'engins, camions et pièces détachées
        disponibles au Sénégal.
      </PageHero>
      <section className="relative mx-auto -mt-9 max-w-[1280px] px-4 pb-24 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 shadow-[0_15px_50px_#18322912]">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setParams(t === "Tous" ? {} : { tab: t })}
                className={cn(
                  "rounded px-5 py-3 text-sm",
                  tab === t
                    ? "bg-brand text-white"
                    : "text-muted hover:text-ink",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2.5 max-sm:w-full">
            <label className="flex h-10 items-center gap-2 border border-line px-3 text-[11px] uppercase tracking-wider text-[#8a9490]">
              Marque
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="bg-white text-xs font-semibold normal-case tracking-normal text-ink outline-none"
              >
                <option value="">Toutes</option>
                {brands.data?.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Machine, référence OEM…"
              className="w-full sm:w-[300px]"
            />
          </div>
        </div>

        <p className="mb-5 mt-9 text-sm text-muted">
          {loading
            ? "Chargement…"
            : `${cards.length} produit${cards.length > 1 ? "s" : ""} disponible${cards.length > 1 ? "s" : ""}`}
        </p>
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBox error={error} />
        ) : cards.length === 0 ? (
          <Empty>Aucun produit ne correspond à votre recherche.</Empty>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <article
                key={c.key}
                className="group border border-[#e5e8e4] bg-white transition hover:-translate-y-1.5 hover:shadow-[0_18px_42px_#18322917]"
              >
                <div className="relative h-[265px] overflow-hidden bg-[#e9ebe6]">
                  <Link to={c.to} className="block size-full">
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <span className="pointer-events-none absolute left-4 top-4 bg-white/95 px-2.5 py-1.5 text-[11px] font-bold uppercase">
                    {c.tag}
                  </span>
                  <button
                    onClick={() => toggleFav(c.key)}
                    aria-label="Favori"
                    className={cn(
                      "absolute right-4 top-4 grid size-9 place-items-center rounded-full",
                      favs.includes(c.key)
                        ? "bg-brand text-lime"
                        : "bg-white/95",
                    )}
                  >
                    <Heart
                      size={17}
                      className={favs.includes(c.key) ? "fill-current" : ""}
                    />
                  </button>
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-bold uppercase tracking-[.13em] text-[#8b9590]">
                    {c.brand}
                  </div>
                  <Link
                    to={c.to}
                    className="mt-2 block font-display text-[19px] font-bold hover:text-olive"
                  >
                    {c.name}
                  </Link>
                  <p className="mt-1 text-[13px] text-muted">{c.meta}</p>
                  <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
                    <div className="grid">
                      <small className="text-[10px] text-[#929b97]">
                        {c.price != null ? "À partir de" : "Prix"} · {c.status}
                      </small>
                      <strong className="font-display text-[17px]">
                        {c.price != null ? fcfa(c.price) : "Sur demande"}
                      </strong>
                    </div>
                    <Link
                      to={c.to}
                      aria-label={`Voir ${c.name}`}
                      className="grid size-[42px] place-items-center rounded-full bg-brand text-white"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
