import AdminLayout from "@/components/layout/AdminLayout";
import PublicLayout from "@/components/layout/PublicLayout";
import { Spinner } from "@/components/ui/States";
import { RequireAuth } from "@/lib/auth";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const page = (loader: () => Promise<{ default: React.ComponentType }>) =>
  lazy(loader);

// Site public
const Home = page(() => import("@/pages/public/HomePage"));
const Catalog = page(() => import("@/pages/public/CatalogPage"));
const ProductDetail = page(() => import("@/pages/public/ProductDetailPage"));
const Services = page(() => import("@/pages/public/ServicesPage"));
const About = page(() => import("@/pages/public/AboutPage"));
const Contact = page(() => import("@/pages/public/ContactPage"));

// Espace admin
const Login = page(() => import("@/pages/admin/LoginPage"));
const Dashboard = page(() => import("@/pages/admin/DashboardPage"));
const Reservations = page(() => import("@/pages/admin/ReservationsPage"));
const Fleet = page(() => import("@/pages/admin/FleetPage"));
const Stock = page(() => import("@/pages/admin/StockPage"));
const Worksites = page(() => import("@/pages/admin/WorksitesPage"));
const Customers = page(() => import("@/pages/admin/CustomersPage"));
const Billing = page(() => import("@/pages/admin/BillingPage"));
const Maintenance = page(() => import("@/pages/admin/MaintenancePage"));
const Inquiries = page(() => import("@/pages/admin/InquiriesPage"));
const Users = page(() => import("@/pages/admin/UsersPage"));
const CustommerDetail = page(() => import("@/pages/admin/CustommerDetailPage"));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="catalogue" element={<Catalog />} />
          <Route path="catalogue/:kind/:id" element={<ProductDetail />} />
          <Route path="services" element={<Services />} />
          <Route path="a-propos" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="admin/login" element={<Login />} />
        <Route
          path="admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="flotte" element={<Fleet />} />
          <Route path="stock" element={<Stock />} />
          <Route path="chantiers" element={<Worksites />} />
          <Route path="clients" element={<Customers />} />
          <Route path="facturation" element={<Billing />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="clients/:id" element={<CustommerDetail />} />
          <Route path="demandes" element={<Inquiries />} />

          <Route
            path="utilisateurs"
            element={
              <RequireAuth role="ADMIN">
                <Users />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
