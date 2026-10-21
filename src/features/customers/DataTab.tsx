import { useState, type ReactNode } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Spinner } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useApi } from "@/lib/hooks";
import type { Paged } from "@/lib/types";

export type Column<T> = { head: string; cell: (row: T) => ReactNode; right?: boolean };

/** Liste paginée d'un type d'élément lié à un client (l'API filtre avec `?customerId=`). */
export function DataTab<T extends { id: string }>({ path, customerId, columns, onRow, empty }: {
  path: string; customerId: string; columns: Column<T>[]; onRow?: (row: T) => void; empty: string;
}) {
  const [page, setPage] = useState(1);
  const list = useApi<Paged<T>>(path, { customerId, page, limit: 8 });
  if (list.isLoading) return <Spinner />;
  if (list.error) return <ErrorBox error={list.error} />;
  if (!list.data?.data.length) return <Empty>{empty}</Empty>;
  return (
    <>
      <Table>
        <thead><tr>{columns.map((c) => <Th key={c.head} className={c.right ? "text-right" : undefined}>{c.head}</Th>)}</tr></thead>
        <tbody>
          {list.data.data.map((row) => (
            <Tr key={row.id} onClick={onRow ? () => onRow(row) : undefined}>
              {columns.map((c) => <Td key={c.head} className={c.right ? "text-right" : undefined}>{c.cell(row)}</Td>)}
            </Tr>
          ))}
        </tbody>
      </Table>
      <Pagination meta={list.data.meta} onPage={setPage} />
    </>
  );
}
