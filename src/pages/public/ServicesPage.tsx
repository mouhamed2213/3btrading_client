import { useInquiry } from "@/components/layout/InquiryModal";
import { Eyebrow, PageHero } from "@/components/shared/PageHero";
import { cn } from "@/lib/cn";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { SERVICES } from "./content";

function ServiceCard({
  service,
  reverse,
}: {
  service: (typeof SERVICES)[number];
  reverse: boolean;
}) {
  const [slide, setSlide] = useState(0);
  const inquiry = useInquiry();
  const count = service.images.length;
  const move = (d: number) => setSlide((s) => (s + d + count) % count);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % count), 5500);
    return () => clearInterval(t);
  }, [count]);

  return (
    <article className="mb-24 grid min-h-[580px] border border-line bg-white shadow-[0_24px_70px_#1832290c] max-lg:mb-10 lg:grid-cols-[1.12fr_.88fr]">
      <div
        className={cn(
          "relative min-h-[330px] overflow-hidden bg-[#dfe4de] lg:min-h-[580px]",
          reverse && "lg:order-2",
        )}
      >
        <img
          key={service.images[slide]}
          src={service.images[slide]}
          alt={`${service.title} par 3B Trading`}
          className="absolute inset-0 size-full animate-fade-up object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#10231c99] to-transparent" />
        <div className="absolute left-6 top-6 bg-white px-3.5 py-2.5 text-[11px] font-bold tracking-widest">
          {String(slide + 1).padStart(2, "0")}{" "}
          <span className="mx-1 text-[#aab2ae]">/</span>{" "}
          {String(count).padStart(2, "0")}
        </div>
        <div className="absolute bottom-6 right-6 flex">
          <button
            onClick={() => move(-1)}
            aria-label="Image précédente"
            className="grid size-12 place-items-center bg-brand text-white hover:bg-lime hover:text-brand"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <button
            onClick={() => move(1)}
            aria-label="Image suivante"
            className="grid size-12 place-items-center bg-white hover:bg-lime hover:text-brand"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="absolute bottom-7 left-6 flex gap-2">
          {service.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Image ${i + 1}`}
              className={cn(
                "h-0.5 w-6",
                i === slide ? "bg-lime" : "bg-white/45",
              )}
            />
          ))}
        </div>
      </div>
      <div
        className={cn(
          "relative flex flex-col justify-center p-8 sm:p-16",
          reverse && "lg:order-1",
        )}
      >
        <div className="absolute right-7 top-6 font-display text-6xl font-extrabold text-[#edf0ed]">
          {service.number}
        </div>
        <Eyebrow>Notre expertise</Eyebrow>
        <h2 className="relative font-display text-[clamp(30px,3vw,45px)] font-bold leading-[1.08] tracking-[-.04em]">
          {service.title}
        </h2>
        <h3 className="my-4 font-display text-[17px] font-medium text-olive">
          {service.subtitle}
        </h3>
        <p className="text-sm leading-7 text-muted">{service.description}</p>
        <ul className="mb-7 mt-4 grid gap-3">
          {service.features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-3 text-[13px] font-semibold"
            >
              <span className="grid size-6 place-items-center rounded-full bg-[#eff5d4] text-[#677b0d]">
                <Check size={14} />
              </span>
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={() => inquiry({ type: service.type })}
          className="flex items-center justify-between border-b border-ink pb-2.5 font-bold"
        >
          Demander une étude <ArrowRight size={18} />
        </button>
      </div>
    </article>
  );
}

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Savoir-faire terrain"
        title={
          <>
            Du sol à la machine,
            <br />
            <em>tout est maîtrisé.</em>
          </>
        }
      >
        Terrassement, location, vente et pièces détachées : un seul
        interlocuteur pour vos chantiers.
      </PageHero>
      <section className="mx-auto max-w-[1380px] px-[5vw] py-24">
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.title} service={s} reverse={i % 2 === 1} />
        ))}
      </section>
    </main>
  );
}
