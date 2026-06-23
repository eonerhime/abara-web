"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartDataPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: ChartDataPoint[];
  currencyCode: string;
}

function formatXAxis(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}

export function RevenueChart({ data, currencyCode }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No transaction data yet. Send a message to your WhatsApp number to get
        started.
      </div>
    );
  }

  // Closures over currencyCode — recharts controls the call signature for these,
  // so currencyCode can't be a parameter.
  const formatAxisCurrency = (value: number): string => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value / 100);
    } catch {
      return String(value);
    }
  };

  const formatTooltipValue = (
    value: number | string | readonly (string | number)[] | undefined,
    name: string,
  ): [string, string] => {
    const numeric = typeof value === "number" ? value : 0;
    return [
      formatCurrency(numeric, currencyCode),
      name === "income" ? "Income" : "Expenses",
    ];
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0A7B3E" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#0A7B3E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatAxisCurrency}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          formatter={formatTooltipValue}
          labelFormatter={(label) => formatXAxis(label as string)}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            fontSize: "12px",
          }}
        />
        <Legend
          formatter={(value) => (value === "income" ? "Income" : "Expenses")}
          wrapperStyle={{ fontSize: "12px" }}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#0A7B3E"
          strokeWidth={2}
          fill="url(#incomeGradient)"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="#EF4444"
          strokeWidth={2}
          fill="url(#expenseGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
