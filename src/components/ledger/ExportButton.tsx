"use client";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Transaction } from "@/types";
import { Download } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";

interface Props {
  from: string;
  to: string;
  businessName: string;
}

export function ExportButton({ from, to, businessName }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        all: "true",
        ...(from && { from }),
        ...(to && { to }),
      });
      const res = await fetch(`/api/proxy/finance/transactions?${params}`);
      const data = await res.json();
      const transactions: Transaction[] = data.transactions ?? [];

      const rows = transactions.map((t) => ({
        Date: formatDate(t.createdAt),
        Type: t.type === "income" ? "Income" : "Expense",
        "Amount (NGN)": (t.amount / 100).toFixed(2),
        Description: t.description,
        Category: t.category ?? "",
        Reference: t.reference,
      }));

      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `abara-ledger-${businessName.replace(/\s+/g, "-")}-${from || "all"}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
    >
      <Download size={15} />
      {loading ? "Exporting…" : "Export CSV"}
    </Button>
  );
}
