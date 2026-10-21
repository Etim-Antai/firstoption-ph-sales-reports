import { describe, it, expect } from 'vitest';
import {
  computeKPIs,
  filterSalesRecords,
  computeMonthlyRevenue,
  computeCategoryBreakdown,
} from '../utils/calculations';
import { INITIAL_SALES_DATA } from '../data/initialData';

describe('Sales Calculations & KPI Verification', () => {
  it('correctly computes baseline KPIs on real company sales data', () => {
    const kpis = computeKPIs(INITIAL_SALES_DATA);

    // Baseline from verified data.csv: 203 transactions, ₦57,031,710 total revenue, 882.5 units, 85 unique customers, 109 invoices
    expect(kpis.totalTransactions).toBe(203);
    expect(kpis.totalRevenue).toBe(57031710);
    expect(kpis.totalUnits).toBe(882.5);
    expect(kpis.uniqueCustomers).toBe(85);
    expect(kpis.uniqueInvoices).toBe(109);
    expect(Math.round(kpis.averageOrderValue)).toBe(Math.round(57031710 / 109));
  });

  it('filters records by category correctly', () => {
    const endUserRecords = filterSalesRecords(INITIAL_SALES_DATA, {
      startDate: '',
      endDate: '',
      year: 'all',
      month: 'all',
      category: 'End User',
      status: 'all',
      search: '',
    });

    expect(endUserRecords.length).toBeGreaterThan(0);
    endUserRecords.forEach((r) => {
      expect(r.customer_category.toLowerCase()).toContain('end user');
    });
  });

  it('filters records by status (New vs Returning)', () => {
    const newRecords = filterSalesRecords(INITIAL_SALES_DATA, {
      startDate: '',
      endDate: '',
      year: 'all',
      month: 'all',
      category: 'all',
      status: 'New',
      search: '',
    });

    newRecords.forEach((r) => {
      expect(r.status.toLowerCase()).toBe('new');
    });
  });

  it('filters by search query across customer and item', () => {
    const filtered = filterSalesRecords(INITIAL_SALES_DATA, {
      startDate: '',
      endDate: '',
      year: 'all',
      month: 'all',
      category: 'all',
      status: 'all',
      search: 'itel',
    });

    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((r) => {
      const match = r.item.toLowerCase().includes('itel') || r.customer.toLowerCase().includes('itel');
      expect(match).toBe(true);
    });
  });

  it('computes category share percentages summing to 100%', () => {
    const breakdown = computeCategoryBreakdown(INITIAL_SALES_DATA);
    expect(breakdown.length).toBeGreaterThan(0);
    const sumShares = breakdown.reduce((sum, c) => sum + c.share, 0);
    expect(Math.round(sumShares)).toBe(100);
  });

  it('aggregates monthly revenue chronologically', () => {
    const monthly = computeMonthlyRevenue(INITIAL_SALES_DATA);
    expect(monthly.length).toBeGreaterThan(0);
    const totalRev = monthly.reduce((sum, m) => sum + m.revenue, 0);
    expect(totalRev).toBe(57031710);
  });
});
