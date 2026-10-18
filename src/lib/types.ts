export type Paged<T> = { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } };

export type Role = "ADMIN" | "STAFF";
export type User = { id: string; email: string; fullName: string; role: Role; isActive?: boolean };

export type Customer = {
  id: string; name: string; type: "ENTREPRISE" | "PARTICULIER" | "PARTENAIRE"; paymentTerms: "COMPTANT" | "A_TERME";
  phone: string; email?: string | null; ninea?: string | null; address?: string | null; notes?: string | null;
  outstanding?: number; openInvoices?: number;
};

export type EquipmentCategory = "CAMION" | "PELLE_HYDRAULIQUE" | "CHARGEUR_TRACTOPELLE" | "BULLDOZER" | "MINI_PELLE_COMPACTEUR";
export type EquipmentStatus = "DISPONIBLE" | "EN_LOCATION" | "MAINTENANCE" | "VENDU";
export type Img = { id: string; url: string; position: number };
export type Equipment = {
  id: string; code: string; name: string; category: EquipmentCategory; brand: string; model?: string | null; year?: number | null;
  serialNumber?: string | null; meterValue: number; meterUnit: "HEURES" | "KM"; powerHp?: number | null; location: string; description?: string | null;
  status: EquipmentStatus; isRentable: boolean; dailyRate?: number | null; rotationRate?: number | null; degressiveFromDays: number;
  degressiveDailyRate?: number | null; isForSale: boolean; salePrice?: number | null; isPublished: boolean; images: Img[];
};

export type PartFamily = "MOTEUR" | "HYDRAULIQUE" | "FILTRATION" | "ELECTRICITE" | "AUTRE";
export type Part = {
  id: string; name: string; brand: string; family: PartFamily; oemReference?: string | null; compatibleModels: string[];
  condition: "NEUF" | "OCCASION"; isOriginal: boolean; price: number; stockQuantity: number; lowStockThreshold: number;
  warrantyMonths?: number | null; description?: string | null; isPublished: boolean; images: Img[];
};

export type ReservationStatus = "EN_ATTENTE" | "CONFIRMEE" | "EN_COURS" | "TERMINEE" | "ANNULEE";
export type Reservation = {
  id: string; reference: string; status: ReservationStatus; startDate: string; endDate: string; pricing: "JOURNALIER" | "ROTATION";
  quantity: number; unitPrice: number; totalAmount: number; isDegressive: boolean; siteLocation?: string | null; operatorName?: string | null; notes?: string | null;
  customer: { id: string; name: string; type: string; paymentTerms: string };
  equipment: { id: string; code: string; name: string; brand?: string; status?: EquipmentStatus };
  payment?: { due: number; paid: number; balance: number; deferred: boolean; canStart: boolean };
  invoices?: { id: string; number: string; type: string; status: string; total: number; paidAmount: number }[];
};

export type WorksiteStatus = "PLANIFIE" | "EN_COURS" | "TERMINE" | "ANNULE";
export type Worksite = {
  id: string; reference: string; name: string; location: string; workType: string; pricing: "FORFAIT" | "VOLUME" | "HORAIRE" | "JOURNEE";
  unitPrice: number; estimatedQuantity?: number | null; budget?: number | null; startDate: string; endDate?: string | null; status: WorksiteStatus; notes?: string | null;
  customer: { id: string; name: string };
  entries?: { id: string; date: string; quantity: number; notes?: string | null; equipment?: { name: string } | null }[];
  progress?: { unit: string; totalQuantity: number; completionPct: number | null; amountToDate: number };
};

export type InvoiceType = "PROFORMA" | "ACOMPTE" | "DEFINITIVE";
export type InvoiceStatus = "A_VALIDER" | "CONVERTIE" | "IMPAYEE" | "PARTIELLE" | "PAYEE" | "ANNULEE";
export type Invoice = {
  id: string; number: string; type: InvoiceType; status: InvoiceStatus; category: "LOCATION" | "CHANTIER" | "VENTE";
  issueDate: string; dueDate: string; subtotal: number; taxRate: number; taxAmount: number; total: number; paidAmount: number; balance: number; isOverdue: boolean; notes?: string | null;
  customer: { id: string; name: string; ninea?: string | null; address?: string | null; phone?: string };
  lines?: { id: string; label: string; quantity: number; unitPrice: number; total: number }[];
  payments?: Payment[];
  reminders?: { id: string; channel: string; note?: string | null; sentAt: string }[];
};
export type Payment = { id: string; receiptNumber: string; amount: number; method: "ESPECES" | "WAVE" | "ORANGE_MONEY"; transactionRef?: string | null; paidAt: string };

export type Maintenance = {
  id: string; reference: string; kind: "INTERNE" | "REPARATION_CLIENT" | "SAV"; type: string; status: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE";
  scheduledDate: string; technician?: string | null; estimatedCost?: number | null; actualCost?: number | null; description?: string | null; externalMachine?: string | null;
  equipment?: { id: string; name: string; code: string } | null; customer?: { id: string; name: string } | null;
};

export type Inquiry = {
  id: string; reference: string; type: string; status: "NOUVELLE" | "EN_COURS" | "TRAITEE"; name: string; phone: string; email?: string | null; message?: string | null;
  desiredStartDate?: string | null; durationRange?: string | null; siteLocation?: string | null; productLabel?: string | null; internalNote?: string | null; createdAt: string;
};

export type PublicEquipment = {
  id: string; code: string; name: string; brand: string; model?: string | null; category: EquipmentCategory; group: "Engins" | "Camions"; year?: number | null;
  meta: string; powerHp?: number | null; location: string; description?: string | null; status: EquipmentStatus; statusLabel: string; salePrice: number | null;
  rental: { dailyRate: number | null; rotationRate: number | null; degressiveFromDays: number; degressiveDailyRate: number | null } | null; images: string[];
};
export type PublicPart = {
  id: string; name: string; brand: string; family: PartFamily; oemReference?: string | null; compatibleModels: string[]; condition: "NEUF" | "OCCASION";
  isOriginal: boolean; price: number; inStock: boolean; stockQuantity: number; warrantyMonths?: number | null; description?: string | null; images: string[];
};

export type Dashboard = {
  kpis: {
    revenueThisMonth: number; revenueGrowthPct: number | null; activeReservations: number; pendingReservations: number; availableEquipment: number;
    totalEquipment: number; unpaidAmount: number; unpaidCount: number; overdueCount: number;
  };
  fleet: { total: number; DISPONIBLE: number; EN_LOCATION: number; MAINTENANCE: number; availablePct: number };
  revenueByMonth: { month: string; services: number; ventes: number }[];
  recentReservations: Reservation[];
  alerts: { newInquiries: number; lowStockParts: number; plannedMaintenance: number };
};
