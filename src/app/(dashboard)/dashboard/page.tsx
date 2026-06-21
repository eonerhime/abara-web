import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { apiServer } from "@/lib/api";
import { formatNaira, formatDate } from "@/lib/utils";
import type { Business, Transaction, InventoryItem } from "@/types";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return redirect("/login");

  const pm = sessionClaims?.publicMetadata as
    | { businessId?: string }
    | undefined;
  const businessId = pm?.businessId as string | undefined;

  if (!businessId) return redirect("/profile");

  // Fetch data in parallel. If endpoints are missing, fall back to placeholders.
  const [businessRes, txRes, inventoryRes] = await Promise.allSettled([
    apiServer(`/internal/businesses/${businessId}` as string, {
      method: "GET",
    }),
    apiServer(`/internal/transactions?limit=5`, {
      method: "GET",
    }),
    apiServer(`/internal/inventory/low-stock?limit=5`, {
      method: "GET",
    }),
  ]);

  const business =
    businessRes.status === "fulfilled" ? (businessRes.value as Business) : null;

  const transactions: Transaction[] =
    txRes.status === "fulfilled" ? (txRes.value as Transaction[]) : [];

  const lowStock: InventoryItem[] =
    inventoryRes.status === "fulfilled"
      ? (inventoryRes.value as InventoryItem[])
      : [];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-sm text-gray-500">Business</h2>
          <p className="text-lg font-medium mt-2">{business?.name ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-1">
            Tier: {business?.tier ?? "—"}
          </p>
          <p className="text-xs text-gray-400">
            Phone: {business?.whatsappPhoneNumber ?? "—"}
          </p>
        </div>

        <div className="col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-sm text-gray-500">Recent activity</h2>
          <ul className="mt-3 space-y-2">
            {Array.isArray(transactions) && transactions.length > 0 ? (
              transactions.map((t: Transaction) => (
                <li key={t.id} className="flex justify-between">
                  <div>
                    <div className="text-sm">
                      {t.description ?? t.reference ?? "Transaction"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(t.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {t.type === "income" ? "+" : "-"}
                    {formatNaira(t.amount ?? 0)}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400">No recent transactions</li>
            )}
          </ul>
        </div>

        <div className="col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-sm text-gray-500">Inventory alerts</h2>
          <ul className="mt-3 space-y-2">
            {Array.isArray(lowStock) && lowStock.length > 0 ? (
              lowStock.map((item: InventoryItem) => (
                <li key={item.id} className="flex justify-between">
                  <div className="text-sm">{item.name}</div>
                  <div className="text-xs text-amber-600">
                    {item.currentStock} left
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400">No low-stock items</li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-sm text-gray-500">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/onboarding/connect-whatsapp"
            className="inline-block px-4 py-2 bg-brand-green text-white rounded"
          >
            Connect WhatsApp
          </a>
          <a
            href="/inventory"
            className="inline-block px-4 py-2 border rounded"
          >
            View inventory
          </a>
          <a href="/ledger" className="inline-block px-4 py-2 border rounded">
            View ledger
          </a>
        </div>
      </div>
    </div>
  );
}
