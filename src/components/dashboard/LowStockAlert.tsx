import { InventoryItem } from "@/types";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Props {
  items: InventoryItem[];
}

export function LowStockAlert({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        ✅ All stock levels are healthy
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <span className="text-sm font-medium text-gray-800 truncate max-w-40">
              {item.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500">
              {item.currentStock}/{item.reorderPoint}
            </span>
            <Badge
              className={
                item.currentStock === 0
                  ? "bg-red-100 text-red-700 text-xs"
                  : "bg-amber-100 text-amber-700 text-xs"
              }
            >
              {item.currentStock === 0 ? "Out" : "Low"}
            </Badge>
          </div>
        </div>
      ))}
      {items.length > 5 && (
        <Link
          href="/inventory"
          className="block text-center text-xs text-brand-green hover:underline pt-1"
        >
          +{items.length - 5} more → View all inventory
        </Link>
      )}
    </div>
  );
}
