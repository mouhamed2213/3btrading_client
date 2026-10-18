export type Tone = "green" | "blue" | "amber" | "red" | "gray";

type Entry = { label: string; tone?: Tone };
const L = (o: Record<string, Entry>) => o;

export const reservationStatus = L({
  EN_ATTENTE: { label: "En attente", tone: "amber" }, CONFIRMEE: { label: "Confirmée", tone: "green" }, EN_COURS: { label: "En cours", tone: "blue" },
  TERMINEE: { label: "Terminée", tone: "gray" }, ANNULEE: { label: "Annulée", tone: "red" },
});
export const equipmentStatus = L({
  DISPONIBLE: { label: "Disponible", tone: "green" }, EN_LOCATION: { label: "En location", tone: "blue" },
  MAINTENANCE: { label: "Maintenance", tone: "amber" }, VENDU: { label: "Vendu", tone: "gray" },
});
export const equipmentCategory = L({
  CAMION: { label: "Camion" }, PELLE_HYDRAULIQUE: { label: "Pelle hydraulique" }, CHARGEUR_TRACTOPELLE: { label: "Chargeur / Tractopelle" },
  BULLDOZER: { label: "Bulldozer" }, MINI_PELLE_COMPACTEUR: { label: "Mini-pelle / Compacteur" },
});
export const partFamily = L({
  MOTEUR: { label: "Moteur" }, HYDRAULIQUE: { label: "Hydraulique" }, FILTRATION: { label: "Filtration" }, ELECTRICITE: { label: "Électricité" }, AUTRE: { label: "Autre" },
});
export const worksiteStatus = L({
  PLANIFIE: { label: "Planifié", tone: "amber" }, EN_COURS: { label: "En cours", tone: "blue" }, TERMINE: { label: "Terminé", tone: "gray" }, ANNULE: { label: "Annulé", tone: "red" },
});
export const workType = L({
  TERRASSEMENT_MASSE: { label: "Terrassement de masse" }, DECAPAGE: { label: "Décapage" }, FOUILLES_PROFONDES: { label: "Fouilles profondes" },
  FOUILLES_TRANCHEES: { label: "Fouilles en tranchées" }, ENROCHEMENT_REMBLAYAGE: { label: "Enrochement / remblayage" }, ASSAINISSEMENT: { label: "Assainissement" }, FONDATIONS: { label: "Fondations" },
});
export const worksitePricing = L({
  FORFAIT: { label: "Forfait global" }, VOLUME: { label: "Au volume (m³)" }, HORAIRE: { label: "À l'heure" }, JOURNEE: { label: "À la journée" },
});
export const invoiceType = L({ PROFORMA: { label: "Proforma" }, ACOMPTE: { label: "Acompte" }, DEFINITIVE: { label: "Facture définitive" } });
export const invoiceStatus = L({
  A_VALIDER: { label: "À valider", tone: "amber" }, CONVERTIE: { label: "Convertie", tone: "gray" }, IMPAYEE: { label: "Impayée", tone: "red" },
  PARTIELLE: { label: "Partielle", tone: "amber" }, PAYEE: { label: "Payée", tone: "green" }, ANNULEE: { label: "Annulée", tone: "gray" },
});
export const paymentMethod = L({ ESPECES: { label: "Espèces" }, WAVE: { label: "Wave" }, ORANGE_MONEY: { label: "Orange Money" } });
export const reminderChannel = L({ TELEPHONE: { label: "Téléphone" }, WHATSAPP: { label: "WhatsApp" }, SMS: { label: "SMS" }, EMAIL: { label: "Email" } });
export const maintenanceKind = L({ INTERNE: { label: "Entretien interne" }, REPARATION_CLIENT: { label: "Réparation client" }, SAV: { label: "SAV / garantie" } });
export const maintenanceType = L({
  ENTRETIEN_PERIODIQUE: { label: "Entretien périodique" }, VIDANGE: { label: "Vidange" }, REPARATION_MECANIQUE: { label: "Réparation mécanique" },
  HYDRAULIQUE: { label: "Hydraulique" }, ELECTRICITE: { label: "Électricité" },
});
export const maintenanceStatus = L({
  PLANIFIEE: { label: "Planifiée", tone: "amber" }, EN_COURS: { label: "En cours", tone: "blue" }, TERMINEE: { label: "Terminée", tone: "green" }, ANNULEE: { label: "Annulée", tone: "gray" },
});
export const customerType = L({ ENTREPRISE: { label: "Entreprise" }, PARTICULIER: { label: "Particulier" }, PARTENAIRE: { label: "Partenaire" } });
export const inquiryType = L({
  LOCATION: { label: "Location" }, TRAVAUX: { label: "Travaux" }, ACHAT: { label: "Achat" }, PIECE: { label: "Pièce" }, CONTACT: { label: "Contact" },
});
export const inquiryStatus = L({ NOUVELLE: { label: "Nouvelle", tone: "amber" }, EN_COURS: { label: "En cours", tone: "blue" }, TRAITEE: { label: "Traitée", tone: "green" } });

export const label = (map: Record<string, Entry>, key: string) => map[key]?.label ?? key;
export const options = (map: Record<string, Entry>) => Object.entries(map).map(([value, e]) => ({ value, label: e.label }));
