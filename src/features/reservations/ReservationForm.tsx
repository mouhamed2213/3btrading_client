import { CustomerSelect, EquipmentSelect } from "@/components/shared/Selects";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { fcfa, today } from "@/lib/format";
import { strOrNull, useForm } from "@/lib/forms";
import { useAction, useApi } from "@/lib/hooks";
import type { Equipment } from "@/lib/types";

const DAY = 86_400_000;

/** Aperçu du prix : même règle que l'API (journalier / dégressif / rotation). L'API reste la référence. */
function preview(
  eq: Equipment | undefined,
  f: { pricing: string; startDate: string; endDate: string; rotations: string },
) {
  if (!eq || !f.startDate || !f.endDate) return null;
  const days =
    Math.round(
      (new Date(f.endDate).getTime() - new Date(f.startDate).getTime()) / DAY,
    ) + 1;
  if (days < 1) return null;
  if (f.pricing === "ROTATION")
    return eq.rotationRate && Number(f.rotations) > 0
      ? {
          qty: `${f.rotations} rotation(s)`,
          unit: eq.rotationRate,
          total: Number(f.rotations) * eq.rotationRate,
          degressive: false,
        }
      : null;
  if (!eq.dailyRate) return null;
  const degressive = !!eq.degressiveDailyRate && days >= eq.degressiveFromDays;
  const unit = degressive ? eq.degressiveDailyRate! : eq.dailyRate;
  return { qty: `${days} jour(s)`, unit, total: days * unit, degressive };
}

export function ReservationForm({ onClose, customerId = "" }: { onClose: () => void; customerId?: string }) {
  const { v, bind } = useForm({
    customerId,
    equipmentId: "",
    startDate: today(),
    endDate: today(),
    pricing: "JOURNALIER",
    rotations: "",
    siteLocation: "",
    operatorName: "",
    notes: "",
  });
  const eq = useApi<Equipment>(`/equipment/${v.equipmentId}`, undefined, {
    enabled: !!v.equipmentId,
  });
  const avail = useApi<{
    available: boolean;
    conflicts: { reference: string }[];
  }>(
    `/equipment/${v.equipmentId}/availability`,
    { from: v.startDate, to: v.endDate },
    { enabled: !!v.equipmentId && !!v.startDate && v.endDate >= v.startDate },
  );
  const price = preview(eq.data, v);
  const save = useAction(
    () =>
      api.post("/reservations", {
        customerId: v.customerId,
        equipmentId: v.equipmentId,
        startDate: v.startDate,
        endDate: v.endDate,
        pricing: v.pricing,
        rotations: v.pricing === "ROTATION" ? Number(v.rotations) : null,
        siteLocation: strOrNull(v.siteLocation),
        operatorName: strOrNull(v.operatorName),
        notes: strOrNull(v.notes),
      }),
    { success: "Réservation créée", onSuccess: onClose },
  );

  return (
    <Modal
      title="Nouvelle réservation"
      subtitle="Location clé en main : opérateur et carburant inclus"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            loading={save.isPending}
            disabled={!v.customerId || !v.equipmentId}
            onClick={() => save.mutate()}
          >
            Créer la réservation
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client">
          <CustomerSelect {...bind("customerId")} />
        </Field>
        <Field label="Engin">
          <EquipmentSelect rentableOnly {...bind("equipmentId")} />
        </Field>
        <Field label="Début">
          <Input type="date" {...bind("startDate")} />
        </Field>
        <Field label="Fin">
          <Input type="date" min={v.startDate} {...bind("endDate")} />
        </Field>
        <Field label="Tarification">
          <Select {...bind("pricing")}>
            <option value="JOURNALIER">Au jour (dégressif automatique)</option>
            <option value="ROTATION">À la rotation (camions)</option>
          </Select>
        </Field>
        {v.pricing === "ROTATION" && (
          <Field label="Nombre de rotations">
            <Input type="number" min={1} {...bind("rotations")} />
          </Field>
        )}
        <Field label="Lieu du chantier">
          <Input {...bind("siteLocation")} />
        </Field>
        <Field label="Opérateur">
          <Input {...bind("operatorName")} />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea {...bind("notes")} />
        </Field>
      </div>
      {avail.data && !avail.data.available && (
        <p className="mt-4 border border-[#f1c9c4] bg-[#fdf1ef] p-3 text-sm text-[#a2433b]">
          Cet engin n'est pas disponible sur cette période
          {avail.data.conflicts[0]
            ? ` (déjà réservé : ${avail.data.conflicts[0].reference})`
            : ""}
          .
        </p>
      )}
      {price && (
        <div className="mt-4 flex items-center justify-between border border-[#dce9c3] bg-[#f8fbe9] p-4 text-sm">
          <span>
            {price.qty} × {fcfa(price.unit)}
            {price.degressive && (
              <b className="ml-2 text-olive">tarif dégressif appliqué</b>
            )}
          </span>
          <b className="font-display text-lg">
            {fcfa(price.total)}{" "}
            <small className="text-[10px] font-normal text-muted">HT</small>
          </b>
        </div>
      )}
    </Modal>
  );
}
