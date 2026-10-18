import { COMPANY } from "@/components/layout/PublicLayout";
import { dateFr, fcfa } from "@/lib/format";
import { invoiceType, label, paymentMethod } from "@/lib/labels";
import type { Invoice } from "@/lib/types";

/** Document imprimable (proforma, acompte, facture). L'impression ne garde que `.print-area`. */
export function InvoiceDocument({ invoice: i }: { invoice: Invoice }) {
  return (
    <div className="print-area mx-auto w-full max-w-[720px] bg-white p-8 text-ink shadow-[0_10px_35px_#13251f18] sm:p-12">
      <div className="flex items-start justify-between border-b-[3px] border-brand pb-6">
        <div><b className="font-display text-xl text-brand">3B TRADING</b><p className="mt-1 text-[11px] leading-5 text-muted">{COMPANY.address}<br />{COMPANY.phone} · {COMPANY.email}</p></div>
        <div className="grid text-right"><b className="font-display text-xl uppercase text-brand">{label(invoiceType, i.type)}</b><strong className="mt-1 text-xs">{i.number}</strong></div>
      </div>
      <div className="my-8 grid gap-8 text-xs text-[#68736e] sm:grid-cols-2">
        <div className="grid gap-1"><small className="text-[9px] tracking-widest">FACTURÉ À</small><b className="text-sm text-ink">{i.customer.name}</b>{i.customer.address && <span>{i.customer.address}</span>}{i.customer.phone && <span>{i.customer.phone}</span>}{i.customer.ninea && <span>NINEA : {i.customer.ninea}</span>}</div>
        <div className="grid gap-1"><small className="text-[9px] tracking-widest">DÉTAILS</small><span>Émise le <b className="text-ink">{dateFr(i.issueDate)}</b></span><span>Échéance <b className="text-ink">{dateFr(i.dueDate)}</b></span></div>
      </div>
      <table className="w-full border-collapse text-xs">
        <thead><tr className="bg-[#f6f8f5] text-left text-[10px] uppercase text-[#929c98]"><th className="p-3">Désignation</th><th className="p-3 text-right">Qté</th><th className="p-3 text-right">Prix unit.</th><th className="p-3 text-right">Total</th></tr></thead>
        <tbody>{i.lines?.map((l) => <tr key={l.id} className="border-b border-[#edf0ed]"><td className="p-3">{l.label}</td><td className="p-3 text-right">{l.quantity}</td><td className="p-3 text-right">{fcfa(l.unitPrice)}</td><td className="p-3 text-right font-bold">{fcfa(l.total)}</td></tr>)}</tbody>
      </table>
      <div className="ml-auto mt-6 grid w-72 gap-1.5 text-xs">
        <span className="flex justify-between"><span>Total HT</span><b>{fcfa(i.subtotal)}</b></span>
        <span className="flex justify-between"><span>TVA ({i.taxRate} %)</span><b>{fcfa(i.taxAmount)}</b></span>
        <span className="flex justify-between bg-[#f0f3ef] p-3 text-sm"><b>Total TTC</b><b className="font-display">{fcfa(i.total)}</b></span>
        {i.paidAmount > 0 && <span className="flex justify-between text-[#278257]"><span>Déjà réglé</span><b>{fcfa(i.paidAmount)}</b></span>}
        {i.type !== "PROFORMA" && i.balance > 0 && <span className="flex justify-between font-bold text-danger"><span>Reste à payer</span><span>{fcfa(i.balance)}</span></span>}
      </div>
      {!!i.payments?.length && <p className="mt-6 text-[11px] text-muted">Règlements : {i.payments.map((p) => `${fcfa(p.amount)} (${label(paymentMethod, p.method)}, ${dateFr(p.paidAt)})`).join(" · ")}</p>}
      {i.notes && <p className="mt-4 text-[11px] text-muted">{i.notes}</p>}
      <p className="mt-10 border-t border-line pt-5 text-[10px] text-[#7c8782]">{i.type === "PROFORMA" ? "Cette proforma ne constitue pas une facture. Validité : 15 jours." : "Paiement par espèces, Wave ou Orange Money."} Merci de votre confiance.</p>
    </div>
  );
}
