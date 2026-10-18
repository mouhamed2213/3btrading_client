import { ArrowRight, ShieldCheck, Timer, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Eyebrow, PageHero } from "@/components/shared/PageHero";
import { buttonClass } from "@/components/ui/Button";
import { IMG } from "./content";

export default function AboutPage() {
  return (
    <main>
      <PageHero eyebrow="Notre histoire" title={<>Bâtisseurs de confiance,<br /><em>depuis plus de 12 ans.</em></>} />
      <section className="mx-auto grid max-w-[1380px] items-center gap-16 px-[5vw] py-24 lg:grid-cols-2 lg:gap-24">
        <div>
          <Eyebrow>3B Trading</Eyebrow>
          <h2 className="mb-6 font-display text-[clamp(34px,4vw,52px)] font-semibold leading-[1.07] tracking-[-.045em]">Une entreprise sénégalaise<br /><em className="not-italic text-[#8c9791]">ancrée dans le terrain.</em></h2>
          <p className="leading-8 text-muted">Nous mettons la performance des grands équipements à la portée des projets qui transforment le Sénégal. Notre exigence : des machines fiables, des hommes compétents et une relation de confiance avec chaque client, du premier devis à la fin du chantier.</p>
          <div className="mt-9 flex flex-wrap gap-8">
            {[[<ShieldCheck key="1" size={18} />, "Fiabilité"], [<Wrench key="2" size={18} />, "Expertise technique"], [<Timer key="3" size={18} />, "Réactivité"]].map(([i, t]) => <b key={String(t)} className="flex items-center gap-2 [&_svg]:text-[#8ba134]">{i}{t}</b>)}
          </div>
          <Link to="/contact" className={buttonClass("dark", "lg", "mt-10")}>Parlons de votre projet <ArrowRight size={18} /></Link>
        </div>
        <img src={IMG.about} alt="Équipe 3B Trading sur chantier" className="h-[350px] w-full object-cover lg:h-[520px]" />
      </section>
    </main>
  );
}
