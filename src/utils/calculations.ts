import { FilterState, KPIStats, MonthlyRevenue, CategorySummary, ProductSummary, WeekdaySummary, SaleRecord } from '../types';

export function filterSalesRecords(records: SaleRecord[], filters: FilterState): SaleRecord[] {
  return records.filter((r) => {
    // Date range filter
    if (filters.startDate && r.date < filters.startDate) return false;
    if (filters.endDate && r.date > filters.endDate) return false;

    // Year filter
    if (filters.year && filters.year !== 'all') {
      const recYear = r.date.split('-')[0];
      if (recYear !== filters.year) return false;
    }

    // Month filter (1-12)
    if (filters.month && filters.month !== 'all') {
      const recMonth = parseInt(r.date.split('-')[1] || '0', 10);
      if (recMonth !== parseInt(filters.month, 10)) return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      const catA = (r.customer_category || '').toLowerCase().trim();
      const catB = filters.category.toLowerCase().trim();
      if (!catA.includes(catB) && catA !== catB) return false;
    }

    // Status filter (New vs Returning)
    if (filters.status && filters.status !== 'all') {
      const s = (r.status || '').toLowerCase().trim();
      const target = filters.status.toLowerCase().trim();
      if (target === 'new') {
        if (s !== 'new') return false;
      } else if (target === 'returning' || target === 'existing') {
        if (s !== 'returning' && s !== 'existing') return false;
      }
    }

    // Search query filter (matches customer, invoice, order id, item, part number)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matches =
        r.customer.toLowerCase().includes(q) ||
        r.invoice_number.toLowerCase().includes(q) ||
        r.sales_order_id.toLowerCase().includes(q) ||
        r.item.toLowerCase().includes(q) ||
        r.part_number.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q) ||
        r.remark.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });
}

export function computeKPIs(records: SaleRecord[]): KPIStats {
  let totalRevenue = 0;
  let totalUnits = 0;
  const customers = new Set<string>();
  const invoices = new Set<string>();
  const salesOrders = new Set<string>();
  const newCustomerSet = new Set<string>();

  for (const r of records) {
    const rev = Number(r.total) || 0;
    const qty = Number(r.quantity) || 0;
    totalRevenue += rev;
    totalUnits += qty;

    const cust = r.customer?.trim();
    if (cust && cust.toLowerCase() !== 'unknown') {
      customers.add(cust.toLowerCase());
      const st = (r.status || '').toLowerCase().trim();
      if (st === 'new') {
        newCustomerSet.add(cust.toLowerCase());
      }
    }

    const inv = r.invoice_number?.trim();
    if (inv) {
      invoices.add(inv);
    }

    const so = r.sales_order_id?.trim();
    if (so && so !== '0' && so.toLowerCase() !== 'null') {
      salesOrders.add(so);
    }
  }

  // If sales orders are present, use unique sales orders; otherwise use unique invoices as order basis
  const orderBasis = salesOrders.size > 0 ? salesOrders.size : invoices.size;
  const averageOrderValue = orderBasis > 0 ? totalRevenue / orderBasis : 0;

  return {
    totalRevenue,
    totalUnits,
    uniqueCustomers: customers.size,
    uniqueInvoices: invoices.size,
    uniqueSalesOrders: salesOrders.size,
    averageOrderValue,
    newCustomers: newCustomerSet.size,
    totalTransactions: records.length,
  };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function computeMonthlyRevenue(records: SaleRecord[]): MonthlyRevenue[] {
  const map: Record<string, { revenue: number; units: number; transactions: number }> = {};

  for (const r of records) {
    if (!r.date) continue;
    const parts = r.date.split('-');
    if (parts.length < 2) continue;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) continue;

    const rawMonth = `${year}-${parts[1]}`;
    if (!map[rawMonth]) {
      map[rawMonth] = { revenue: 0, units: 0, transactions: 0 };
    }
    map[rawMonth].revenue += Number(r.total) || 0;
    map[rawMonth].units += Number(r.quantity) || 0;
    map[rawMonth].transactions += 1;
  }

  const sortedKeys = Object.keys(map).sort();
  return sortedKeys.map((k) => {
    const [y, mStr] = k.split('-');
    const mIdx = parseInt(mStr, 10) - 1;
    const shortYear = y.slice(-2);
    const label = `${MONTH_NAMES[mIdx]} ${shortYear}`;
    return {
      rawMonth: k,
      month: label,
      revenue: map[k].revenue,
      units: map[k].units,
      transactions: map[k].transactions,
    };
  });
}

export function computeCategoryBreakdown(records: SaleRecord[]): CategorySummary[] {
  const map: Record<string, { revenue: number; count: number }> = {};
  let totalRev = 0;

  for (const r of records) {
    let cat = (r.customer_category || 'Unspecified').trim();
    if (!cat) cat = 'Unspecified';
    // Normalize casing
    if (cat.toLowerCase() === 'end user' || cat.toLowerCase() === 'end users') cat = 'End User';
    else if (cat.toLowerCase() === 'installer' || cat.toLowerCase() === 'installers') cat = 'Installer';
    else if (cat.toLowerCase() === 'corporate') cat = 'Corporate';
    else if (cat.toLowerCase() === 'online') cat = 'Online';
    else if (cat.toLowerCase() === 'partner') cat = 'Partner';

    if (!map[cat]) {
      map[cat] = { revenue: 0, count: 0 };
    }
    const rev = Number(r.total) || 0;
    map[cat].revenue += rev;
    map[cat].count += 1;
    totalRev += rev;
  }

  return Object.entries(map)
    .map(([cat, val]) => ({
      category: cat,
      revenue: val.revenue,
      transactions: val.count,
      share: totalRev > 0 ? (val.revenue / totalRev) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeTopProducts(records: SaleRecord[]): ProductSummary[] {
  const map: Record<string, { revenue: number; units: number; part_number: string; count: number }> = {};

  for (const r of records) {
    const item = (r.item || 'Unknown Item').trim();
    if (!map[item]) {
      map[item] = {
        revenue: 0,
        units: 0,
        part_number: r.part_number || '',
        count: 0,
      };
    }
    map[item].revenue += Number(r.total) || 0;
    map[item].units += Number(r.quantity) || 0;
    map[item].count += 1;
    if (!map[item].part_number && r.part_number) {
      map[item].part_number = r.part_number;
    }
  }

  return Object.entries(map)
    .map(([item, val]) => ({
      item,
      part_number: val.part_number,
      revenue: val.revenue,
      units: val.units,
      average_rate: val.units > 0 ? val.revenue / val.units : 0,
      transactions: val.count,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeWeekdaySales(records: SaleRecord[]): WeekdaySummary[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const stats = days.map((d, i) => ({
    day: d,
    dayIndex: i,
    revenue: 0,
    units: 0,
    transactions: 0,
  }));

  for (const r of records) {
    if (!r.date) continue;
    // create date object safely with UTC to prevent timezone shifts
    const parts = r.date.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      if (!isNaN(d.getTime())) {
        const dayIdx = d.getDay();
        stats[dayIdx].revenue += Number(r.total) || 0;
        stats[dayIdx].units += Number(r.quantity) || 0;
        stats[dayIdx].transactions += 1;
      }
    }
  }

  // Return Monday to Sunday order
  return [stats[1], stats[2], stats[3], stats[4], stats[5], stats[6], stats[0]];
}

export function computeCustomerStatusBreakdown(records: SaleRecord[]) {
  let newRev = 0;
  let returningRev = 0;
  const newCust = new Set<string>();
  const returningCust = new Set<string>();

  for (const r of records) {
    const cust = (r.customer || '').trim();
    const s = (r.status || '').toLowerCase().trim();
    const rev = Number(r.total) || 0;

    if (s === 'new') {
      newRev += rev;
      if (cust) newCust.add(cust.toLowerCase());
    } else {
      returningRev += rev;
      if (cust) returningCust.add(cust.toLowerCase());
    }
  }

  return {
    newCustomersCount: newCust.size,
    newRevenue: newRev,
    returningCustomersCount: returningCust.size,
    returningRevenue: returningRev,
  };
}
