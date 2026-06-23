"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Transaction } from "@/types";
import { formatNaira, formatDate, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: Props) {
  // Fixed: Added the array bracket [] to the ColumnDef type argument
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {formatDate(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <Badge
              className={
                type === "income"
                  ? "bg-green-100 text-green-700 text-xs"
                  : "bg-red-100 text-red-700 text-xs"
              }
            >
              {type === "income" ? "Income" : "Expense"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const type = row.original.type;
          const amount = row.original.amount;
          return (
            <span
              className={`text-sm font-semibold tabular-nums ${
                type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {type === "expense" ? "−" : "+"}
              {formatNaira(amount)}
            </span>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-700">
            {truncate(getValue() as string, 45)}
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
        accessorKey: "reference",
        header: "Ref",
        cell: ({ getValue }) => (
          <span className="text-xs font-mono text-gray-400">
            {getValue() as string}
          </span>
        ),
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">No transactions found.</p>
        <p className="text-xs mt-1">
          Send a WhatsApp message to record your first transaction.
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
                  className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
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
