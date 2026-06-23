import { Badge } from "@/components/ui/badge";

interface Props {
  currentStock: number;
  reorderPoint: number;
  daysUntilExpiry?: number | null;
}

export function StockBadge({
  currentStock,
  reorderPoint,
  daysUntilExpiry,
}: Props) {
  if (currentStock === 0) {
    return (
      <Badge className="bg-red-100 text-red-700 text-xs font-medium">
        Out of Stock
      </Badge>
    );
  }
  if (
    daysUntilExpiry !== null &&
    daysUntilExpiry !== undefined &&
    daysUntilExpiry <= 30
  ) {
    return (
      <Badge className="bg-purple-100 text-purple-700 text-xs font-medium">
        Expiring
      </Badge>
    );
  }
  if (currentStock <= reorderPoint) {
    return (
      <Badge className="bg-amber-100 text-amber-700 text-xs font-medium">
        Low Stock
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-700 text-xs font-medium">
      Adequate
    </Badge>
  );
}
