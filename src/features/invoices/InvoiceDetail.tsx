import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Options, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { dateFr, dateTimeFr, fcfa } from "@/lib/format";
import { useForm } from "@/lib/forms";
import { useAction, useApi } from "@/lib/hooks";
import {
  invoiceStatus,
  label,
  options,
  paymentMethod,
  reminderChannel,
} from "@/lib/labels";
import type { Invoice } from "@/lib/types";
import {
  Ban,
  BellRing,
  FileCheck2,
  Printer,
  Receipt,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { InvoiceDocument } from "./InvoiceDocument";
import { ReceiptModal } from "./ReceiptModal";

export function InvoiceDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { data: i } = useApi<Invoice>(`/invoices/${id}`);
  const [receipt, setReceipt] = useState<string | null>(null);
  const pay = useForm({ amount: "", method: "ESPECES", transactionRef: "" });
  const rem = useForm({ channel: "WHATSAPP", note: "" });
  const conv = useForm({ type: "DEFINITIVE", amount: "" });

  const payment = useAction(
    () =>
      api.post(`/invoices/${id}/payments`, {
        amount: Number(pay.v.amount || i?.balance),
        method: pay.v.method,
        transactionRef: pay.v.transactionRef || null,
      }),
    {
      success: "Paiement enregistré — reçu généré",
      onSuccess: () =>
        pay.setV((s) => ({ ...s, amount: "", transactionRef: "" })),
    },
  );
  const reminder = useAction(
    () =>
      api.post(`/invoices/${id}/reminders`, {
        channel: rem.v.channel,
        note: rem.v.note || null,
      }),
    {
      success: "Relance enregistrée",
      onSuccess: () => rem.setV((s) => ({ ...s, note: "" })),
    },
  );
  const convert = useAction(
    () =>
      api.post(`/invoices/${id}/convert`, {
        type: conv.v.type,
        amount:
          conv.v.type === "ACOMPTE" && conv.v.amount
            ? Number(conv.v.amount)
            : undefined,
      }),
    { success: "Proforma convertie", onSuccess: onClose },
  );
  const cancel = useAction(() => api.post(`/invoices/${id}/cancel`), {
    success: "Facture annulée",
  });

  if (!i) return null;
  const open = i.status === "IMPAYEE" || i.status === "PARTIELLE";
  const mobile = pay.v.method !== "ESPECES";
  const box = "grid gap-3 border border-line p-4";

  return (
    <>
      <Modal
        size="xl"
        title={i.number}
        subtitle={i.customer.name}
        onClose={onClose}
        className="bg-[#e9ede9]"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <InvoiceDocument invoice={i} />
          <aside className="no-print grid content-start gap-4 bg-white p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge map={invoiceStatus} value={i.status} />
              {i.isOverdue && (
                <span className="text-xs font-bold text-danger">
                  En retard (échéance {dateFr(i.dueDate)})
                </span>
              )}
            </div>
            <Button
              variant="outline"
              icon={<Printer size={16} />}
              onClick={() => window.print()}
            >
              Imprimer / PDF
            </Button>

            {i.type === "PROFORMA" && i.status === "A_VALIDER" && (
              <div className={box}>
                <b className="flex items-center gap-2">
                  <FileCheck2 size={16} />
                  Valider la proforma
                </b>
                <Select {...conv.bind("type")}>
                  <option value="DEFINITIVE">Facture définitive</option>
                  <option value="ACOMPTE">Facture d'acompte</option>
                </Select>
                {conv.v.type === "ACOMPTE" && (
                  <Field label="Montant HT" hint="Vide = 100 %">
                    <Input type="number" min={0} {...conv.bind("amount")} />
                  </Field>
                )}
                <Button
                  loading={convert.isPending}
                  onClick={() => convert.mutate()}
                >
                  Convertir
                </Button>
              </div>
            )}

            {open && (
              <div className={box}>
                <b className="flex items-center gap-2">
                  <Wallet size={16} />
                  Encaisser · reste {fcfa(i.balance)}
                </b>
                <Field label="Montant (FCFA)">
                  <Input
                    type="number"
                    min={1}
                    max={i.balance}
                    placeholder={String(i.balance)}
                    {...pay.bind("amount")}
                  />
                </Field>
                <Field label="Mode de paiement">
                  <Select {...pay.bind("method")}>
                    <Options items={options(paymentMethod)} />
                  </Select>
                </Field>
                {mobile && (
                  <Field label="Référence de transaction">
                    <Input
                      {...pay.bind("transactionRef")}
                      placeholder="ID Wave / Orange Money"
                    />
                  </Field>
                )}
                <Button
                  loading={payment.isPending}
                  disabled={mobile && !pay.v.transactionRef}
                  onClick={() => payment.mutate()}
                >
                  Enregistrer le paiement
                </Button>
              </div>
            )}

            {!!i.payments?.length && (
              <div className={box}>
                <b className="flex items-center gap-2">
                  <Receipt size={16} />
                  Paiements & reçus
                </b>
                {i.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b border-line pb-2 text-xs"
                  >
                    <span>
                      <b>{fcfa(p.amount)}</b>
                      <br />
                      <span className="text-muted">
                        {label(paymentMethod, p.method)} ·{" "}
                        {dateTimeFr(p.paidAt)}
                      </span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReceipt(p.id)}
                    >
                      {p.receiptNumber}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {open && (
              <div className={box}>
                <b className="flex items-center gap-2">
                  <BellRing size={16} />
                  Relancer le client
                </b>
                <Select {...rem.bind("channel")}>
                  <Options items={options(reminderChannel)} />
                </Select>
                <Input placeholder="Note (facultatif)" {...rem.bind("note")} />
                <Button
                  variant="outline"
                  loading={reminder.isPending}
                  onClick={() => reminder.mutate()}
                >
                  Enregistrer la relance
                </Button>
                {i.reminders?.map((r) => (
                  <p key={r.id} className="text-[11px] text-muted">
                    {dateTimeFr(r.sentAt)} · {label(reminderChannel, r.channel)}
                    {r.note ? ` — ${r.note}` : ""}
                  </p>
                ))}
              </div>
            )}

            {!["ANNULEE", "CONVERTIE"].includes(i.status) &&
              i.paidAmount === 0 && (
                <Button
                  variant="danger"
                  icon={<Ban size={16} />}
                  loading={cancel.isPending}
                  onClick={() =>
                    confirm(`Annuler ${i.number} ?`) && cancel.mutate()
                  }
                >
                  Annuler le document
                </Button>
              )}
          </aside>
        </div>
      </Modal>
      {receipt && (
        <ReceiptModal paymentId={receipt} onClose={() => setReceipt(null)} />
      )}
    </>
  );
}
