import { Button } from "@/components/ui/Button";
import { Field, Input, Options, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { fcfa } from "@/lib/format";
import { strOrNull, useForm } from "@/lib/forms";
import { useAction } from "@/lib/hooks";
import { customerType, options } from "@/lib/labels";
import type { Customer } from "@/lib/types";

export function CustomerForm({
  item,
  onClose,
}: {
  item?: Customer;
  onClose: () => void;
}) {
  const { v, bind } = useForm({
    name: item?.name ?? "",
    type: item?.type ?? "ENTREPRISE",
    paymentTerms: item?.paymentTerms ?? "COMPTANT",
    phone: item?.phone ?? "",
    email: item?.email ?? "",
    ninea: item?.ninea ?? "",
    address: item?.address ?? "",
    notes: item?.notes ?? "",
  });
  const body = () => ({
    name: v.name,
    type: v.type,
    paymentTerms: v.type === "PARTENAIRE" ? v.paymentTerms : "COMPTANT",
    phone: v.phone,
    email: strOrNull(v.email as string),
    ninea: strOrNull(v.ninea as string),
    address: strOrNull(v.address as string),
    notes: strOrNull(v.notes as string),
  });
  const save = useAction(
    () =>
      item
        ? api.patch(`/customers/${item.id}`, body())
        : api.post("/customers", body()),
    { success: item ? "Client mis à jour" : "Client créé", onSuccess: onClose },
  );
  return (
    <Modal
      title={item ? item.name : "Nouveau client"}
      subtitle={
        item?.outstanding
          ? `Encours : ${fcfa(item.outstanding)} (${item.openInvoices} facture(s))`
          : undefined
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            loading={save.isPending}
            disabled={!v.name || !v.phone}
            onClick={() => save.mutate()}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom / raison sociale" className="sm:col-span-2">
          <Input {...bind("name")} />
        </Field>
        <Field label="Type">
          <Select {...bind("type")}>
            <Options items={options(customerType)} />
          </Select>
        </Field>
        {v.type === "PARTENAIRE" ? (
          <Field
            label="Conditions de paiement"
            hint="À terme = facturation fin de mois"
          >
            <Select {...bind("paymentTerms")}>
              <option value="COMPTANT">Au comptant (avant sortie)</option>
              <option value="A_TERME">À terme</option>
            </Select>
          </Field>
        ) : (
          <span />
        )}
        <Field label="Téléphone">
          <Input {...bind("phone")} />
        </Field>
        <Field label="Email">
          <Input type="email" {...bind("email")} />
        </Field>
        <Field label="NINEA">
          <Input {...bind("ninea")} />
        </Field>
        <Field label="Adresse">
          <Input {...bind("address")} />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea {...bind("notes")} />
        </Field>
      </div>
    </Modal>
  );
}
