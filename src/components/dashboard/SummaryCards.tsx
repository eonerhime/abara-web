import { FinanceSummary } from "@/types";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  summary: FinanceSummary;
  lowStockCount: number;
  currencyCode: string; // e.g. business.currency
}

export function SummaryCards({ summary, lowStockCount, currencyCode }: Props) {
  const cards = [
    {
      label: "Today's Income",
      value: formatCurrency(summary.income, currencyCode),
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
      icon: TrendingUp,
      iconColor: "text-green-500",
    },
    {
      label: "Today's Expenses",
      value: formatCurrency(summary.expenses, currencyCode),
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
      icon: TrendingDown,
      iconColor: "text-red-500",
    },
    {
      label: "Net Position",
      value: formatCurrency(summary.net, currencyCode),
      color: summary.net >= 0 ? "text-green-600" : "text-red-600",
      bg: summary.net >= 0 ? "bg-green-50" : "bg-red-50",
      border: summary.net >= 0 ? "border-green-100" : "border-red-100",
      icon: summary.net >= 0 ? TrendingUp : TrendingDown,
      iconColor: summary.net >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      label: "Low Stock Alerts",
      value: `${lowStockCount} item${lowStockCount !== 1 ? "s" : ""}`,
      color: lowStockCount > 0 ? "text-amber-600" : "text-gray-600",
      bg: lowStockCount > 0 ? "bg-amber-50" : "bg-gray-50",
      border: lowStockCount > 0 ? "border-amber-100" : "border-gray-100",
      icon: AlertTriangle,
      iconColor: lowStockCount > 0 ? "text-amber-500" : "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(
        ({ label, value, color, bg, border, icon: Icon, iconColor }) => (
          <div
            key={label}
            className={`rounded-xl border ${border} ${bg} p-4 flex flex-col gap-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {label}
              </span>
              <Icon size={16} className={iconColor} />
            </div>
            <span className={`text-xl font-bold ${color} leading-tight`}>
              {value}
            </span>
          </div>
        ),
      )}
    </div>
  );
}
