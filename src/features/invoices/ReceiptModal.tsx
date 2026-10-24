import { Printer } from "lucide-react";
import { useRef } from "react";
import { COMPANY } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { dateTimeFr, fcfa } from "@/lib/format";
import { useApi } from "@/lib/hooks";
import { printElement } from "@/lib/print";
import { label, paymentMethod } from "@/lib/labels";
import type { Payment } from "@/lib/types";

type Receipt = Payment & { remainingBalance: number; invoice: { number: string; total: number; customer: { name: string; phone?: string } } };

export function ReceiptModal({ paymentId, onClose }: { paymentId: string; onClose: () => void }) {
  const { data: r } = useApi<Receipt>(`/payments/${paymentId}`);
  const docRef = useRef<HTMLDivElement>(null);
  return (
    <Modal title="Reçu de paiement" onClose={onClose} size="sm" footer={<Button icon={<Printer size={16} />} onClick={() => docRef.current && printElement(docRef.current, r?.receiptNumber)}>Imprimer</Button>}>
      {r && (
        <div ref={docRef} className="grid gap-4 bg-white p-2 text-sm">
          <div className="flex justify-between border-b-[3px] border-brand pb-4"><div><b className="font-display text-lg text-brand">3B TRADING</b><p className="text-[11px] text-muted">{COMPANY.address}<br />{COMPANY.phone}</p></div><div className="text-right"><b className="uppercase text-brand">Reçu</b><p className="text-xs font-bold">{r.receiptNumber}</p><p className="text-[11px] text-muted">{dateTimeFr(r.paidAt)}</p></div></div>
          <p>Reçu de <b>{r.invoice.customer.name}</b> la somme de</p>
          <p className="bg-[#f0f3ef] p-4 text-center font-display text-2xl font-bold">{fcfa(r.amount)}</p>
          <div className="grid gap-1 text-xs text-muted"><span>Facture : <b className="text-ink">{r.invoice.number}</b> (total {fcfa(r.invoice.total)})</span><span>Mode : <b className="text-ink">{label(paymentMethod, r.method)}</b>{r.transactionRef ? ` · réf. ${r.transactionRef}` : ""}</span><span>Solde actuel de la facture : <b className="text-ink">{fcfa(r.remainingBalance)}</b></span></div>
        </div>
      )}
    </Modal>
  );
}
