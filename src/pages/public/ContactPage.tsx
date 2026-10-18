import { CheckCircle2, Clock, Home, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { COMPANY } from "@/components/layout/PublicLayout";
import { InquiryForm } from "@/components/layout/InquiryModal";
import { PageHero } from "@/components/shared/PageHero";

export default function ContactPage() {
  const [ref, setRef] = useState("");
  return (
    <main>
      <PageHero eyebrow="Parlons de votre projet" title={<>Votre prochain chantier<br /><em>commence ici.</em></>} />
      <section className="mx-auto grid max-w-[1380px] gap-16 px-[5vw] py-24 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
        <div>
          <h2 className="font-display text-4xl font-semibold tracking-tight">Décrivez-nous votre besoin.</h2>
          <p className="mt-3 text-muted">Notre équipe commerciale vous répond sous 24 heures ouvrées.</p>
          <div className="mt-10 grid gap-5 [&_svg]:text-olive">
            {[[<Phone key="p" />, COMPANY.phone], [<Mail key="m" />, COMPANY.email], [<Home key="h" />, COMPANY.address], [<Clock key="c" />, COMPANY.hours]].map(([i, t]) => <span key={String(t)} className="flex items-center gap-4">{i}<b>{t}</b></span>)}
          </div>
        </div>
        {ref ? (
          <div className="grid content-center justify-items-center gap-3 border border-line bg-white p-12 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-lime text-brand"><CheckCircle2 size={30} /></span>
            <p className="font-display text-xl font-bold">Merci, c'est bien reçu !</p>
            <p className="text-sm text-muted">Référence <b className="text-ink">{ref}</b>. Un conseiller vous contacte sous 24 heures ouvrées.</p>
          </div>
        ) : <InquiryForm preset={{ type: "CONTACT" }} onDone={setRef} />}
      </section>
    </main>
  );
}
