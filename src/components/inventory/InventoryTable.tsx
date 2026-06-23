"use client";

import { formatDate } from "@/lib/utils";
import { InventoryItem } from "@/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { StockBadge } from "./StockBadge";

interface Props {
  items: InventoryItem[];
}

export function InventoryTable({ items }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "currentStock", desc: false }, // Default: lowest stock first
  ]);

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-gray-900">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-400 font-mono">
          {(getValue() as string) ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-500 capitalize">
          {(getValue() as string) ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "currentStock",
      header: "Stock",
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold tabular-nums text-gray-800">
          {getValue() as number}
        </span>
      ),
    },
    {
      accessorKey: "reorderPoint",
      header: "Reorder At",
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500 tabular-nums">
          {getValue() as number}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <StockBadge
          currentStock={row.original.currentStock}
          reorderPoint={row.original.reorderPoint}
          daysUntilExpiry={row.original.daysUntilExpiry}
        />
      ),
    },
    {
      accessorKey: "nearestExpiry",
      header: "Nearest Expiry",
      cell: ({ getValue }) => {
        const v = getValue() as string | null;
        return (
          <span className="text-xs text-gray-500">
            {v ? formatDate(v) : "—"}
          </span>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">No inventory items yet.</p>
        <p className="text-xs mt-1">
          Send &quot;r/ 200 Paracetamol&quot; to your WhatsApp number to add
          stock.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getIsSorted() === "asc" && (
                      <ChevronUp size={12} />
                    )}
                    {header.column.getIsSorted() === "desc" && (
                      <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-3 px-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
