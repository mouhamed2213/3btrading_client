import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CustomerForm } from "@/features/customers/CustomerForm";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAction, useApi, useDebounced } from "@/lib/hooks";
import { customerType, label } from "@/lib/labels";
import type { Customer, Paged } from "@/lib/types";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function CustomersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const q = useDebounced(search);
  const list = useApi<Paged<Customer>>("/customers", {
    q: q || undefined,
    page,
    limit: 15,
  });
  const del = useAction((id: string) => api.delete(`/customers/${id}`), {
    success: "Client supprimé",
  });
  const item =
    editing && editing !== "new"
      ? list.data?.data.find((c) => c.id === editing)
      : undefined;

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Entreprises, particuliers et partenaires."
        action={
          <Button icon={<Plus size={16} />} onClick={() => setEditing("new")}>
            Nouveau client
          </Button>
        }
      />
      <Card>
        <div className="p-4">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            className="w-full sm:w-80"
            placeholder="Nom, téléphone, NINEA…"
          />
        </div>
        <QueryState q={list} empty={list.data?.data.length === 0}>
          <Table>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Type</Th>
                <Th>Paiement</Th>
                <Th>Téléphone</Th>
                <Th>NINEA</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {list.data?.data.map((c) => (
                <Tr key={c.id} onClick={() => setEditing(c.id)}>
                  <Td>
                    <b className="text-ink">{c.name}</b>
                  </Td>
                  <Td>{label(customerType, c.type)}</Td>
                  <Td>
                    {c.paymentTerms === "A_TERME" ? (
                      <Badge tone="blue">À terme</Badge>
                    ) : (
                      <Badge>Comptant</Badge>
                    )}
                  </Td>
                  <Td>{c.phone}</Td>
                  <Td>{c.ninea ?? "—"}</Td>
                  <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/clients/${c.id}`}
                        className="p-1.5 text-muted hover:text-ink"
                        aria-label={`Ouvrir le dossier de ${c.name}`}
                        title="Voir le dossier client"
                      >
                        <Eye size={15} />
                      </Link>
                      {user?.role === "ADMIN" && (
                        <button
                          className="p-1.5 text-muted hover:text-danger"
                          aria-label="Supprimer"
                          onClick={() =>
                            confirm(`Supprimer « ${c.name} » ?`) &&
                            del.mutate(c.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </QueryState>
        <Pagination meta={list.data?.meta} onPage={setPage} />
      </Card>
      {editing === "new" && <CustomerForm onClose={() => setEditing(null)} />}
      {item && (
        <CustomerForm
          key={item.id}
          item={item}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
