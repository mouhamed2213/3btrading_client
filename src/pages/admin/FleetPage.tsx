import { ImageManager } from "@/components/shared/ImageManager";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Checkbox,
  Field,
  Input,
  Options,
  Select,
  Textarea,
} from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { QueryState } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fcfa, num } from "@/lib/format";
import { numOrNull, strOrNull, useForm } from "@/lib/forms";
import { useAction, useApi, useDebounced } from "@/lib/hooks";
import {
  equipmentCategory,
  equipmentStatus,
  label,
  options,
} from "@/lib/labels";
import type { Equipment, Paged } from "@/lib/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Combobox } from "@/components/ui/Combobox";

const s = (n?: number | null) => (n == null ? "" : String(n));

function EquipmentForm({
  item,
  onClose,
}: {
  item?: Equipment;
  onClose: () => void;
}) {
  const { v, bind, check } = useForm({
    name: item?.name ?? "",
    category: item?.category ?? "PELLE_HYDRAULIQUE",
    brand: item?.brand ?? "",
    model: item?.model ?? "",
    year: s(item?.year),
    serialNumber: item?.serialNumber ?? "",
    meterValue: s(item?.meterValue ?? 0),
    meterUnit: item?.meterUnit ?? "HEURES",
    powerHp: s(item?.powerHp),
    location: item?.location ?? "Dakar",
    description: item?.description ?? "",
    status: item && item.status !== "EN_LOCATION" ? item.status : "DISPONIBLE",
    isRentable: item?.isRentable ?? true,
    dailyRate: s(item?.dailyRate),
    rotationRate: s(item?.rotationRate),
    degressiveFromDays: s(item?.degressiveFromDays ?? 7),
    degressiveDailyRate: s(item?.degressiveDailyRate),
    isForSale: item?.isForSale ?? false,
    salePrice: s(item?.salePrice),
    isPublished: item?.isPublished ?? false,
  });
  const body = () => ({
    name: v.name,
    category: v.category,
    brand: v.brand,
    model: strOrNull(v.model as string),
    year: numOrNull(v.year as string),
    serialNumber: strOrNull(v.serialNumber as string),
    meterValue: Number(v.meterValue || 0),
    meterUnit: v.meterUnit,
    powerHp: numOrNull(v.powerHp as string),
    location: v.location,
    description: strOrNull(v.description as string),
    ...(item?.status === "EN_LOCATION" ? {} : { status: v.status }),
    isRentable: v.isRentable,
    dailyRate: v.isRentable ? numOrNull(v.dailyRate as string) : null,
    rotationRate: v.isRentable ? numOrNull(v.rotationRate as string) : null,
    degressiveFromDays: Number(v.degressiveFromDays || 7),
    degressiveDailyRate: v.isRentable
      ? numOrNull(v.degressiveDailyRate as string)
      : null,
    isForSale: v.isForSale,
    salePrice: v.isForSale ? numOrNull(v.salePrice as string) : null,
    isPublished: v.isPublished,
  });
  const save = useAction(
    () =>
      item
        ? api.patch(`/equipment/${item.id}`, body())
        : api.post("/equipment", body()),
    { success: item ? "Engin mis à jour" : "Engin créé", onSuccess: onClose },
  );
  const ck = (k: "isRentable" | "isForSale" | "isPublished", l: string) => (
    <Checkbox {...{ ...check(k), label: l }} />
  );

  return (
    <Modal
      size="lg"
      title={item ? `${item.code} · ${item.name}` : "Nouvel engin"}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button
            loading={save.isPending}
            disabled={!v.name || !v.brand}
            onClick={() => save.mutate()}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Désignation" className="sm:col-span-2">
          <Input {...bind("name")} placeholder="Pelle hydraulique CAT 320D" />
        </Field>
        <Field label="Catégorie">
          <Combobox
            {...bind("category")}
            options={options(equipmentCategory)}
            clearable={false}
            placeholder="Catégorie"
            searchPlaceholder="Rechercher une catégorie…"
          />
        </Field>
        <Field label="Marque">
          <Input {...bind("brand")} />
        </Field>
        <Field label="Modèle">
          <Input {...bind("model")} />
        </Field>
        <Field label="Année">
          <Input type="number" {...bind("year")} />
        </Field>
        <Field label="N° de série">
          <Input {...bind("serialNumber")} />
        </Field>
        <Field label="Compteur">
          <Input type="number" min={0} {...bind("meterValue")} />
        </Field>
        <Field label="Unité">
          <Select {...bind("meterUnit")}>
            <option value="HEURES">Heures</option>
            <option value="KM">Kilomètres</option>
          </Select>
        </Field>
        <Field label="Puissance (ch)">
          <Input type="number" {...bind("powerHp")} />
        </Field>
        <Field label="Localisation">
          <Input {...bind("location")} />
        </Field>
        {item?.status !== "EN_LOCATION" && (
          <Field label="Statut">
            <Select {...bind("status")}>
              <option value="DISPONIBLE">Disponible</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="VENDU">Vendu</option>
            </Select>
          </Field>
        )}
        <Field label="Description" className="sm:col-span-3">
          <Textarea {...bind("description")} />
        </Field>

        <div className="grid gap-4 border border-line p-4 sm:col-span-3 sm:grid-cols-4">
          <div className="sm:col-span-4">
            {ck(
              "isRentable",
              "Louable (clé en main, opérateur + carburant inclus)",
            )}
          </div>
          {v.isRentable && (
            <>
              <Field label="Tarif / jour (FCFA)">
                <Input type="number" min={0} {...bind("dailyRate")} />
              </Field>
              <Field label="Tarif / rotation">
                <Input type="number" min={0} {...bind("rotationRate")} />
              </Field>
              <Field label="Dégressif dès (jours)">
                <Input type="number" min={2} {...bind("degressiveFromDays")} />
              </Field>
              <Field label="Tarif dégressif / jour">
                <Input type="number" min={0} {...bind("degressiveDailyRate")} />
              </Field>
            </>
          )}
        </div>
        <div className="grid gap-4 border border-line p-4 sm:col-span-3 sm:grid-cols-3">
          <div className="sm:col-span-3">{ck("isForSale", "À vendre")}</div>
          {v.isForSale && (
            <Field label="Prix de vente (FCFA)">
              <Input type="number" min={0} {...bind("salePrice")} />
            </Field>
          )}
          <div className="self-end">
            {ck("isPublished", "Visible sur le site public")}
          </div>
        </div>
        <div className="sm:col-span-3">
          <p className="mb-2 text-xs font-bold text-[#57635d]">Photos</p>
          {item ? (
            <ImageManager
              images={item.images}
              uploadPath={`/equipment/${item.id}/images`}
            />
          ) : (
            <p className="text-xs text-muted">
              Enregistrez l'engin pour ajouter des photos.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function FleetPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const q = useDebounced(search);
  const list = useApi<Paged<Equipment>>("/equipment", {
    q: q || undefined,
    category: category || undefined,
    status: status || undefined,
    page,
    limit: 15,
  });
  const item =
    editing && editing !== "new"
      ? list.data?.data.find((x) => x.id === editing)
      : undefined;
  const del = useAction((id: string) => api.delete(`/equipment/${id}`), {
    success: "Engin supprimé",
  });
  const reset =
    <T,>(f: (v: T) => void) =>
    (v: T) => {
      f(v);
      setPage(1);
    };

  return (
    <>
      <PageHeader
        title="Flotte & engins"
        subtitle="Parc de machines et camions : location, vente et état en temps réel."
        action={
          <Button icon={<Plus size={16} />} onClick={() => setEditing("new")}>
            Ajouter un engin
          </Button>
        }
      />
      <Card>
        <div className="flex flex-wrap gap-3 p-4">
          <SearchInput
            value={search}
            onChange={reset(setSearch)}
            className="w-full sm:w-72"
            placeholder="Nom, marque, code, n° de série…"
          />
          <Select
            className="w-auto"
            value={category}
            onChange={(e) => reset(setCategory)(e.target.value)}
          >
            <Options
              placeholder="Toutes catégories"
              items={options(equipmentCategory)}
            />
          </Select>
          <Select
            className="w-auto"
            value={status}
            onChange={(e) => reset(setStatus)(e.target.value)}
          >
            <Options
              placeholder="Tous statuts"
              items={options(equipmentStatus)}
            />
          </Select>
        </div>
        <QueryState q={list} empty={list.data?.data.length === 0}>
          <Table>
            <thead>
              <tr>
                <Th>Engin</Th>
                <Th>Catégorie</Th>
                <Th>Compteur</Th>
                <Th>Statut</Th>
                <Th className="text-right">Tarif / jour</Th>
                <Th className="text-right">Prix de vente</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {list.data?.data.map((e) => (
                <Tr key={e.id} onClick={() => setEditing(e.id)}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <img
                        src={e.images[0]?.url ?? ""}
                        alt=""
                        className="size-11 bg-surface object-cover"
                      />
                      <span className="grid">
                        <b className="text-ink">{e.name}</b>
                        <small className="text-[11px]">
                          {e.code} · {e.brand}
                        </small>
                      </span>
                    </div>
                  </Td>
                  <Td>{label(equipmentCategory, e.category)}</Td>
                  <Td>
                    {num(e.meterValue)} {e.meterUnit === "HEURES" ? "h" : "km"}
                  </Td>
                  <Td>
                    <StatusBadge map={equipmentStatus} value={e.status} />
                  </Td>
                  <Td className="text-right">
                    {e.isRentable ? fcfa(e.dailyRate) : "—"}
                  </Td>
                  <Td className="text-right">
                    {e.isForSale ? fcfa(e.salePrice) : "—"}
                  </Td>
                  <Td
                    className="text-right"
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <button
                      className="p-1.5 text-muted hover:text-ink"
                      onClick={() => setEditing(e.id)}
                      aria-label="Modifier"
                    >
                      <Pencil size={15} />
                    </button>
                    {user?.role === "ADMIN" && (
                      <button
                        className="p-1.5 text-muted hover:text-danger"
                        aria-label="Supprimer"
                        onClick={() =>
                          confirm(`Supprimer « ${e.name} » ?`) &&
                          del.mutate(e.id)
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
      {editing === "new" && <EquipmentForm onClose={() => setEditing(null)} />}
      {item && (
        <EquipmentForm
          key={item.id}
          item={item}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
