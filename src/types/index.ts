export type CustomerCategory = 'End User' | 'Installer' | 'Corporate' | 'Online' | 'Partner' | string;
export type CustomerStatus = 'New' | 'Returning' | 'EXISTING' | 'NEW' | string;

export interface SaleRecord {
  id: string | number;
  date: string; // YYYY-MM-DD
  customer: string;
  sales_order_id: string;
  contact: string;
  status: CustomerStatus;
  customer_category: CustomerCategory;
  invoice_number: string;
  item: string;
  part_number: string;
  quantity: number;
  rate: number;
  remark: string;
  total: number;
  created_at?: string;
  updated_at?: string;
  batch_id?: string;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  year: string;
  month: string;
  category: string;
  status: string;
  search: string;
}

export interface KPIStats {
  totalRevenue: number;
  totalUnits: number;
  uniqueCustomers: number;
  uniqueInvoices: number;
  uniqueSalesOrders: number;
  averageOrderValue: number;
  newCustomers: number;
  totalTransactions: number;
  revenueChangePct?: number | null;
  unitsChangePct?: number | null;
}

export interface MonthlyRevenue {
  month: string; // "Jan 26", etc.
  rawMonth: string; // "2026-01"
  revenue: number;
  units: number;
  transactions: number;
}

export interface CategorySummary {
  category: string;
  revenue: number;
  transactions: number;
  share: number; // percentage 0 - 100
}

export interface ProductSummary {
  item: string;
  part_number: string;
  revenue: number;
  units: number;
  average_rate: number;
  transactions: number;
}

export interface WeekdaySummary {
  day: string;
  dayIndex: number; // 0=Sunday, 1=Monday...
  revenue: number;
  units: number;
  transactions: number;
}

export interface CustomerSummary {
  customer: string;
  contact: string;
  category: string;
  status: string;
  totalRevenue: number;
  totalUnits: number;
  invoicesCount: number;
  firstDate: string;
  lastDate: string;
}

export interface ImportValidationResult {
  rowNumber: number;
  data: Partial<SaleRecord>;
  errors: string[];
  warnings: string[];
  isValid: boolean;
  isDuplicate: boolean;
  rateTotalDiscrepancy: boolean;
}

export type UserRole = 'admin' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
