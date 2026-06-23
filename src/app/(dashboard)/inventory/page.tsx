"use client";

import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { InventoryItem } from "@/types";
import { useEffect, useState } from "react";

type StatusFilter = "all" | "low" | "out" | "expiring";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          ...(search && { search }),
          ...(status === "low" && { lowStockOnly: "true" }),
          ...(status === "expiring" && { expiringWithin: "30" }),
        });

        const res = await fetch(`/api/proxy/inventory/items?${params}`);
        const data = await res.json();
        let fetchedItems: InventoryItem[] = data.items ?? [];

        // Client-side filter for "out of stock"
        if (status === "out") {
          fetchedItems = fetchedItems.filter((i) => i.currentStock === 0);
        }

        setItems(fetchedItems);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchItems();
  }, [search, status]);

  const counts = {
    all: items.length,
    low: items.filter(
      (i) => i.currentStock > 0 && i.currentStock <= i.reorderPoint,
    ).length,
    out: items.filter((i) => i.currentStock === 0).length,
    expiring: items.filter(
      (i) => i.daysUntilExpiry !== null && (i.daysUntilExpiry ?? 999) <= 30,
    ).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-500 text-sm mt-1">
          Stock levels and expiry tracking
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="max-w-55"
        />

        <Select
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All items</SelectItem>
            <SelectItem value="low">Low stock ({counts.low})</SelectItem>
            <SelectItem value="out">Out of stock ({counts.out})</SelectItem>
            <SelectItem value="expiring">
              Expiring soon ({counts.expiring})
            </SelectItem>
          </SelectContent>
        </Select>

        {(search || status !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatus("all");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <InventoryTable items={items} />
        )}
      </div>
    </div>
  );
}
