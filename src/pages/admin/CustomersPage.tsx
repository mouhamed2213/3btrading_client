import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Options, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fcfa } from "@/lib/format";
import { strOrNull, useForm } from "@/lib/forms";
import { useAction, useApi, useDebounced } from "@/lib/hooks";
import { customerType, label, options } from "@/lib/labels";
import type { Customer, Paged } from "@/lib/types";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function CustomerForm({
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
                <Th>Action</Th>
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
                  <Td
                    className="text-right flex gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* View detail */}
                    {user?.role === "ADMIN" && (
                      <Link
                        to={`/admin/clients/${user.id}`}
                        className="p-1.5 text-muted hover:text-danger"
                        aria-label="view detail client"
                      >
                        <Eye size={15} />
                      </Link>
                    )}

                    {/* Delete user */}
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
