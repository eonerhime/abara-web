// Business
export interface Business {
  id: string;
  name: string;
  whatsappPhoneNumber: string;
  phoneNumberId: string | null;
  tier: "starter" | "growth" | "enterprise";
  isActive: boolean;
  createdAt: string;
}

// Auth session
export interface SessionUser {
  businessId: string;
  name: string;
  email: string;
  whatsappPhoneNumber: string;
  phoneNumberId: string | null;
  tier: string;
}

// Finance
export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number; // kobo
  description: string;
  category: string;
  reference: string;
  createdAt: string;
}

export interface FinanceSummary {
  period: string;
  from: string;
  to: string;
  income: number; // kobo
  expenses: number; // kobo
  net: number; // kobo
  transactionCount: number;
  chartData?: ChartDataPoint[];
}

export interface ChartDataPoint {
  date: string;
  income: number;
  expenses: number;
}

// Inventory
export interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  currentStock: number;
  reorderPoint: number;
  sellingPriceKobo: number;
  costPriceKobo: number;
  nearestExpiry?: string | null;
  daysUntilExpiry?: number | null;
}

export interface InventoryBatch {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
  batchNumber: string | null;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API error
export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
