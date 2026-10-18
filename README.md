# 3B Trading — Frontend

React 19 · TypeScript · Vite · **Tailwind CSS v4** · React Router · TanStack Query · lucide-react.
Site public (accueil, catalogue, services, contact) + espace administrateur connectés à l'API `server/`.

## Démarrage

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:4000/api
npm run dev              # http://localhost:5173
npm run build            # typecheck + build de production (dist/)
```

L'API doit tourner (voir `../server/README.md`). Compte initial : celui créé par `npm run db:seed` côté serveur.
Le serveur autorise l'origine du frontend via `CORS_ORIGINS` (défaut `http://localhost:5173`).

## Organisation

```
src/
  main.tsx · App.tsx           providers + table des routes (pages chargées à la demande)
  index.css                    Tailwind + thème (couleurs, polices) dans @theme
  lib/                         api.ts (fetch + JWT) · hooks.ts (useApi / useAction) · auth.tsx · forms.ts
                               types.ts (modèles API) · labels.ts (libellés/couleurs des statuts) · format.ts
  components/
    ui/                        briques génériques : Button, Field, Modal, Table, Badge, Tabs, Toast…
    layout/                    PublicLayout, AdminLayout, formulaire de demande (InquiryModal)
    shared/                    éléments métier réutilisés : Logo, PageHeader, ImageManager, Selects
  features/                    composants propres à un domaine (invoices/, reservations/)
  pages/
    public/                    Home, Catalog, ProductDetail, Services, About, Contact
    admin/                     Login, Dashboard, Reservations, Fleet, Stock, Worksites, Customers,
                               Billing, Maintenance, Inquiries, Users
```

Conventions : une page = un fichier ; les formulaires/modales d'une page vivent dans le même fichier tant qu'ils ne servent qu'à elle, sinon dans `features/`. Les textes de statut et leurs couleurs sont centralisés dans `lib/labels.ts`.

## Routes

Public : `/` · `/catalogue` · `/catalogue/engins/:id` · `/catalogue/pieces/:id` · `/services` · `/a-propos` · `/contact`
Admin (connexion requise) : `/admin` · `/admin/reservations` · `/flotte` · `/stock` · `/chantiers` · `/clients` · `/facturation` · `/maintenance` · `/demandes` · `/utilisateurs` (admin)

## Fonctionnement

- **Données** : `useApi(path, params)` lit (cache TanStack Query) ; `useAction(fn)` écrit, affiche un toast puis rafraîchit tout le cache (flotte, factures et tableau de bord sont liés).
- **Session** : JWT en `localStorage`, ajouté par `lib/api.ts` ; une réponse 401 ramène à la connexion.
- **Règles métier** : appliquées par l'API (paiement avant sortie, déduction d'acomptes, stock, dispo). Le frontend les affiche et relaie les erreurs.
- **Impression** : factures et reçus s'impriment via le dialogue du navigateur (« Enregistrer au format PDF »).
# 3btrading_client
