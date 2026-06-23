"use client";

import { useState, useEffect, useCallback } from "react";
// 1. Swapped out next-auth for Clerk
import { useUser } from "@clerk/nextjs";
import { Transaction } from "@/types";
import { TransactionTable } from "@/components/ledger/TransactionTable";
import { ExportButton } from "@/components/ledger/ExportButton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LedgerPage() {
  // 2. Retrieve user context dynamically via Clerk
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Safely grab business layout name or name from metadata / username fallback
  const businessName = user?.fullName || user?.username || "business";
  //
  const fetchTransactions = useCallback(async () => {
    // 1. Keep the execution loop asynchronous by putting the loading trigger here
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(type !== "all" && { type }),
        ...(search && { search }),
        ...(from && { from }),
        ...(to && { to }),
      });

      const res = await fetch(`/api/proxy/finance/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.transactions ?? []);
      setTotalPages(data.pagination?.pages ?? 1);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page, type, search, from, to]);

  useEffect(() => {
    // 1. Assign the timeout to handleFetch
    const handleFetch = setTimeout(() => {
      fetchTransactions();
    }, 0);

    // 2. Correctly clear handleFetch on unmount
    return () => clearTimeout(handleFetch);
  }, [fetchTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
          <p className="text-gray-500 text-sm mt-1">
            All transactions for your business
          </p>
        </div>
        <ExportButton from={from} to={to} businessName={businessName} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search description…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-50"
        />

        <Select
          value={type}
          onValueChange={(v) => {
            setType(v as typeof type);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="w-35"
          />
          <span className="text-gray-400 text-sm">to</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="w-35"
          />
        </div>

        {(search || type !== "all" || from || to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setType("all");
              setFrom("");
              setTo("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <TransactionTable transactions={transactions} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
