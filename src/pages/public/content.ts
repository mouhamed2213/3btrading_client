const u = (id: string, w = 1200, q = 85) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const IMG = {
  hero: u("photo-1583024011792-b165975b52f5", 1800, 88),
  showcase: u("photo-1603814744174-115311ad645e"),
  about: u("photo-1597974385058-66a931a50a7a", 1000),
  placeholder: u("photo-1580901369227-308f6f40bdeb", 900, 80),
};

export const BRANDS = ["CATERPILLAR", "KOMATSU", "HITACHI", "Mercedes-Benz", "VOLVO"];

export const SERVICES = [
  {
    number: "01", title: "Terrassement & travaux", subtitle: "Préparer le terrain pour construire durablement.", type: "TRAVAUX" as const,
    description: "Terrassement de masse, nivellement, décapage, fouilles profondes et fondations : nos équipes interviennent avec une méthode précise, du diagnostic initial à la livraison du terrain.",
    features: ["Étude et visite technique", "Tarification au volume ou au forfait", "Suivi quotidien du chantier"],
    images: [u("photo-1575281923032-f40d94ef6160"), u("photo-1597974385058-66a931a50a7a"), u("photo-1786263136636-cd6d8dd771be")],
  },
  {
    number: "02", title: "Location d'engins", subtitle: "La bonne machine, au bon moment.", type: "LOCATION" as const,
    description: "Des pelles, bulldozers, chargeuses et compacteurs entretenus, livrés avec un opérateur qualifié et le carburant. Nos offres s'adaptent à la journée, à la rotation ou à la durée.",
    features: ["Chauffeur et carburant inclus", "Tarifs dégressifs dès 7 jours", "Assistance technique terrain"],
    images: [u("photo-1580901369227-308f6f40bdeb"), u("photo-1583024011792-b165975b52f5"), u("photo-1603814744174-115311ad645e")],
  },
  {
    number: "03", title: "Vente d'engins & camions", subtitle: "Des équipements contrôlés, prêts à produire.", type: "ACHAT" as const,
    description: "Nous sélectionnons des machines et camions toutes marques selon leur historique, leur état mécanique et leur potentiel d'exploitation. Chaque équipement est présenté avec une fiche transparente.",
    features: ["Contrôle mécanique complet", "Historique et compteur vérifiés", "Accompagnement jusqu'à la livraison"],
    images: [u("photo-1622645636770-11fbf0611463"), u("photo-1653924333410-0dda83ae490c"), u("photo-1523660778745-247ed0bcce31")],
  },
  {
    number: "04", title: "Pièces détachées", subtitle: "La pièce exacte, sans immobilisation inutile.", type: "PIECE" as const,
    description: "Notre catalogue couvre les principales familles moteur, hydraulique, filtration et électricité. La recherche s'effectue par marque, modèle, compatibilité ou référence constructeur OEM.",
    features: ["Pièces d'origine et compatibles", "Recherche par référence OEM", "Conseil de compatibilité"],
    images: [u("photo-1652248759121-2edb066a9557"), u("photo-1603814744347-31a27ca92271"), u("photo-1580901368813-93220b510345")],
  },
];
