import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useForm } from "@/lib/forms";
import { useAction, useApi } from "@/lib/hooks";
import type { User } from "@/lib/types";
import { KeyRound, Plus } from "lucide-react";
import { useState } from "react";

function NewUser({ onClose }: { onClose: () => void }) {
  const { v, bind } = useForm({
    fullName: "",
    email: "",
    password: "",
    role: "STAFF",
  });
  const save = useAction(() => api.post("/users", v), {
    success: "Compte créé",
    onSuccess: onClose,
  });
  return (
    <Modal
      size="sm"
      title="Nouvel utilisateur"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            loading={save.isPending}
            disabled={!v.fullName || !v.email || String(v.password).length < 8}
            onClick={() => save.mutate()}
          >
            Créer
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Nom complet">
          <Input {...bind("fullName")} />
        </Field>
        <Field label="Email">
          <Input type="email" {...bind("email")} />
        </Field>
        <Field label="Mot de passe" hint="8 caractères minimum">
          <Input type="password" {...bind("password")} />
        </Field>
        <Field label="Rôle">
          <Select {...bind("role")}>
            <option value="STAFF">Équipe</option>
            <option value="ADMIN">Administrateur</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const [creating, setCreating] = useState(false);
  const list = useApi<(User & { createdAt: string })[]>("/users");
  const update = useAction(
    ({
      id,
      ...body
    }: {
      id: string;
      isActive?: boolean;
      role?: string;
      password?: string;
    }) => api.patch(`/users/${id}`, body),
    { success: "Compte mis à jour" },
  );

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle="Comptes d'accès à l'espace administrateur."
        action={
          <Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>
            Nouvel utilisateur
          </Button>
        }
      />
      <Card>
        <QueryState q={list} empty={list.data?.length === 0}>
          <Table>
            <thead>
              <tr>
                <Th>Nom</Th>
                <Th>Email</Th>
                <Th>Rôle</Th>
                <Th>Statut</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {list.data?.map((u) => (
                <Tr key={u.id}>
                  <Td>
                    <b className="text-ink">{u.fullName}</b>
                    {u.id === me?.id && (
                      <span className="ml-2 text-xs text-muted">(vous)</span>
                    )}
                  </Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <Select
                      className="h-8 w-auto text-xs"
                      value={u.role}
                      disabled={u.id === me?.id}
                      onChange={(e) =>
                        update.mutate({ id: u.id, role: e.target.value })
                      }
                    >
                      <option value="STAFF">Équipe</option>
                      <option value="ADMIN">Administrateur</option>
                    </Select>
                  </Td>
                  <Td>
                    {u.isActive ? (
                      <Badge tone="green">Actif</Badge>
                    ) : (
                      <Badge tone="gray">Désactivé</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<KeyRound size={13} />}
                        onClick={() => {
                          const p = prompt(
                            `Nouveau mot de passe pour ${u.fullName} (8 caractères min.)`,
                          );
                          if (p && p.length >= 8)
                            update.mutate({ id: u.id, password: p });
                        }}
                      >
                        Mot de passe
                      </Button>
                      {u.id !== me?.id && (
                        <Button
                          size="sm"
                          variant={u.isActive ? "outline" : "dark"}
                          onClick={() =>
                            update.mutate({ id: u.id, isActive: !u.isActive })
                          }
                        >
                          {u.isActive ? "Désactiver" : "Réactiver"}
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </QueryState>
      </Card>
      {creating && <NewUser onClose={() => setCreating(false)} />}
    </>
  );
}
