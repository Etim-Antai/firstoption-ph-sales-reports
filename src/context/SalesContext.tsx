import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FilterState, KPIStats, MonthlyRevenue, CategorySummary, ProductSummary, WeekdaySummary, SaleRecord } from '../types';
import { getAllSales, addSale, updateSale, deleteSale, bulkInsertSales, resetLocalSalesToDefault, clearAllLocalSales } from '../lib/supabase';
import { filterSalesRecords, computeKPIs, computeMonthlyRevenue, computeCategoryBreakdown, computeTopProducts, computeWeekdaySales, computeCustomerStatusBreakdown } from '../utils/calculations';

interface SalesContextType {
  sales: SaleRecord[];
  filteredSales: SaleRecord[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  kpis: KPIStats;
  monthlyData: MonthlyRevenue[];
  categoryData: CategorySummary[];
  topProducts: ProductSummary[];
  weekdayData: WeekdaySummary[];
  customerStatusData: {
    newCustomersCount: number;
    newRevenue: number;
    returningCustomersCount: number;
    returningRevenue: number;
  };
  refresh: () => Promise<void>;
  createRecord: (record: Omit<SaleRecord, 'id'>) => Promise<SaleRecord>;
  updateRecord: (id: string | number, updates: Partial<SaleRecord>) => Promise<SaleRecord>;
  deleteRecord: (id: string | number) => Promise<void>;
  importRecords: (records: Partial<SaleRecord>[], filename: string) => Promise<{ inserted: number }>;
  resetDemoData: () => void;
  clearDatabase: () => void;
}

const defaultFilters: FilterState = {
  startDate: '',
  endDate: '',
  year: 'all',
  month: 'all',
  category: 'all',
  status: 'all',
  search: '',
};

const SalesContext = createContext<SalesContextType | null>(null);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await getAllSales();
      setSales(records);
    } catch (err: any) {
      console.error('Failed to load sales transactions:', err);
      setError(err.message || 'Failed to fetch sales records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const filteredSales = useMemo(() => {
    return filterSalesRecords(sales, filters);
  }, [sales, filters]);

  const kpis = useMemo(() => {
    return computeKPIs(filteredSales);
  }, [filteredSales]);

  const monthlyData = useMemo(() => {
    return computeMonthlyRevenue(filteredSales);
  }, [filteredSales]);

  const categoryData = useMemo(() => {
    return computeCategoryBreakdown(filteredSales);
  }, [filteredSales]);

  const topProducts = useMemo(() => {
    return computeTopProducts(filteredSales);
  }, [filteredSales]);

  const weekdayData = useMemo(() => {
    return computeWeekdaySales(filteredSales);
  }, [filteredSales]);

  const customerStatusData = useMemo(() => {
    return computeCustomerStatusBreakdown(filteredSales);
  }, [filteredSales]);

  const createRecord = async (record: Omit<SaleRecord, 'id'>) => {
    const created = await addSale(record);
    setSales((prev) => [created, ...prev]);
    return created;
  };

  const updateRecord = async (id: string | number, updates: Partial<SaleRecord>) => {
    const updated = await updateSale(id, updates);
    setSales((prev) => prev.map((s) => (String(s.id) === String(id) ? updated : s)));
    return updated;
  };

  const deleteRecord = async (id: string | number) => {
    await deleteSale(id);
    setSales((prev) => prev.filter((s) => String(s.id) !== String(id)));
  };

  const importRecords = async (records: Partial<SaleRecord>[], filename: string) => {
    const res = await bulkInsertSales(records, filename);
    await loadData();
    return res;
  };

  const resetDemoData = () => {
    resetLocalSalesToDefault();
    loadData();
  };

  const clearDatabase = () => {
    clearAllLocalSales();
    setSales([]);
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        filteredSales,
        loading,
        error,
        filters,
        setFilters,
        resetFilters,
        kpis,
        monthlyData,
        categoryData,
        topProducts,
        weekdayData,
        customerStatusData,
        refresh: loadData,
        createRecord,
        updateRecord,
        deleteRecord,
        importRecords,
        resetDemoData,
        clearDatabase,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
