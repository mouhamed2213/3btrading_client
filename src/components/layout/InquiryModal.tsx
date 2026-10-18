import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { api, errorMessage } from "@/lib/api";
import { useAction } from "@/lib/hooks";
import { CheckCircle2 } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";

export type InquiryPreset = {
  type?: "LOCATION" | "TRAVAUX" | "ACHAT" | "PIECE" | "CONTACT";
  productLabel?: string;
  equipmentId?: string;
  partId?: string;
};
const Ctx = createContext<(p?: InquiryPreset) => void>(() => {});
export const useInquiry = () => useContext(Ctx);

const NEEDS = [
  { value: "LOCATION", label: "Location d'engin" },
  { value: "TRAVAUX", label: "Travaux de terrassement" },
  { value: "ACHAT", label: "Achat d'engin ou camion" },
  { value: "PIECE", label: "Pièce détachée" },
  { value: "CONTACT", label: "Autre demande" },
];

/** Formulaire public (réservation / devis / contact) + fournisseur de contexte pour l'ouvrir depuis n'importe quelle page. */
export function InquiryProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<InquiryPreset | null>(null);
  return (
    <Ctx.Provider value={(p) => setPreset(p ?? {})}>
      {children}
      {preset && (
        <InquiryModal preset={preset} onClose={() => setPreset(null)} />
      )}
    </Ctx.Provider>
  );
}

export function InquiryForm({
  preset = {},
  onDone,
}: {
  preset?: InquiryPreset;
  onDone?: (ref: string) => void;
}) {
  const [f, setF] = useState({
    type: preset.type ?? "LOCATION",
    name: "",
    phone: "",
    email: "",
    message: "",
    desiredStartDate: "",
    durationRange: "",
    siteLocation: "",
    website: "",
  });
  const [error, setError] = useState("");
  const submit = useAction(
    () =>
      api.post<{ reference: string }>("/public/inquiries", {
        type: f.type,
        name: f.name,
        phone: f.phone,
        email: f.email || null,
        message: f.message || null,
        website: f.website,
        desiredStartDate: f.desiredStartDate || null,
        durationRange: f.durationRange || null,
        siteLocation: f.siteLocation || null,
        productLabel: preset.productLabel ?? null,
        equipmentId: preset.equipmentId ?? null,
        partId: preset.partId ?? null,
      }),
    { onSuccess: (r) => onDone?.(r.reference) },
  );
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((s) => ({ ...s, [k]: e.target.value }));
  const rental = f.type === "LOCATION" || f.type === "TRAVAUX";

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        submit.mutate(undefined, {
          onError: (er) => setError(errorMessage(er)),
        });
      }}
    >
      {preset.productLabel && (
        <p className="border-l-2 border-lime bg-cream px-3 py-2 text-sm">
          Produit concerné : <b>{preset.productLabel}</b>
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Votre besoin">
          <Select value={f.type} onChange={set("type")}>
            {NEEDS.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nom complet">
          <Input
            required
            minLength={2}
            value={f.name}
            onChange={set("name")}
            placeholder="Ex. Awa Fall"
          />
        </Field>
        <Field label="Téléphone / WhatsApp">
          <Input
            required
            minLength={6}
            value={f.phone}
            onChange={set("phone")}
            placeholder="+221 77 000 00 00"
          />
        </Field>
        <Field label="Email (facultatif)">
          <Input type="email" value={f.email} onChange={set("email")} />
        </Field>
        {rental && (
          <>
            <Field label="Date souhaitée">
              <Input
                type="date"
                value={f.desiredStartDate}
                onChange={set("desiredStartDate")}
              />
            </Field>
            <Field label="Durée estimée">
              <Select value={f.durationRange} onChange={set("durationRange")}>
                <option value="">À préciser</option>
                <option value="1-3">1 à 3 jours</option>
                <option value="4-7">4 à 7 jours</option>
                <option value="7+">Plus de 7 jours</option>
              </Select>
            </Field>
            <Field label="Lieu du chantier" className="sm:col-span-2">
              <Input
                value={f.siteLocation}
                onChange={set("siteLocation")}
                placeholder="Ville / quartier"
              />
            </Field>
          </>
        )}
      </div>
      <Field label="Message">
        <Textarea
          value={f.message}
          onChange={set("message")}
          placeholder="Décrivez votre projet…"
        />
      </Field>
      {/* champ piège anti-spam : invisible pour les humains */}
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        value={f.website}
        onChange={set("website")}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" loading={submit.isPending}>
        Envoyer ma demande
      </Button>
    </form>
  );
}

function InquiryModal({
  preset,
  onClose,
}: {
  preset: InquiryPreset;
  onClose: () => void;
}) {
  const [ref, setRef] = useState("");
  if (ref) {
    return (
      <Modal title="Demande envoyée" onClose={onClose} size="sm">
        <div className="grid justify-items-center gap-3 py-4 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-lime text-brand">
            <CheckCircle2 size={30} />
          </span>
          <p className="font-display text-lg font-bold">
            Merci, c'est bien reçu !
          </p>
          <p className="text-sm text-muted">
            Référence <b className="text-ink">{ref}</b>. Un conseiller vous
            contacte sous 24 heures ouvrées.
          </p>
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </Modal>
    );
  }
  return (
    <Modal
      title="Réserver ou demander une offre"
      subtitle="Réponse sous 24 heures ouvrées"
      onClose={onClose}
    >
      <InquiryForm preset={preset} onDone={setRef} />
    </Modal>
  );
}
