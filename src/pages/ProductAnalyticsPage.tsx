import React, { useState, useMemo } from 'react';
import { Package, Search, AlertCircle, Info, Layers, DollarSign } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { KpiCard } from '../components/KpiCard';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const ProductAnalyticsPage: React.FC = () => {
  const { filteredSales } = useSales();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'units' | 'avg_rate'>('revenue');

  // Aggregated product list
  const productAnalytics = useMemo(() => {
    const map: Record<
      string,
      {
        item: string;
        part_number: string;
        revenue: number;
        units: number;
        transactions: number;
        minRate: number;
        maxRate: number;
      }
    > = {};

    let totalRevenue = 0;
    let totalUnits = 0;

    // Part number consistency map: part_number -> Set of item names
    const partNumberAuditMap: Record<string, Set<string>> = {};

    filteredSales.forEach((r) => {
      const item = (r.item || 'Unknown Item').trim();
      const part = (r.part_number || '').trim();
      const rev = Number(r.total) || 0;
      const qty = Number(r.quantity) || 0;
      const rate = Number(r.rate) || 0;

      totalRevenue += rev;
      totalUnits += qty;

      if (part) {
        if (!partNumberAuditMap[part]) {
          partNumberAuditMap[part] = new Set();
        }
        partNumberAuditMap[part].add(item);
      }

      const key = item.toLowerCase();
      if (!map[key]) {
        map[key] = {
          item,
          part_number: part,
          revenue: 0,
          units: 0,
          transactions: 0,
          minRate: rate,
          maxRate: rate,
        };
      }

      map[key].revenue += rev;
      map[key].units += qty;
      map[key].transactions += 1;
      if (rate < map[key].minRate) map[key].minRate = rate;
      if (rate > map[key].maxRate) map[key].maxRate = rate;
      if (!map[key].part_number && part) map[key].part_number = part;
    });

    const list = Object.values(map).map((p) => ({
      ...p,
      averageRate: p.units > 0 ? p.revenue / p.units : 0,
      share: totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0,
    }));

    // Find inconsistent part numbers
    const inconsistentPartNumbers = Object.entries(partNumberAuditMap)
      .filter(([_, items]) => items.size > 1)
      .map(([part, items]) => ({
        partNumber: part,
        items: Array.from(items),
      }));

    return {
      list,
      totalDistinctItems: list.length,
      totalRevenue,
      totalUnits,
      inconsistentPartNumbers,
    };
  }, [filteredSales]);

  // Sort & filter products
  const displayedProducts = useMemo(() => {
    let result = [...productAnalytics.list];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) => p.item.toLowerCase().includes(q) || p.part_number.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      if (sortBy === 'units') return b.units - a.units;
      if (sortBy === 'avg_rate') return b.averageRate - a.averageRate;
      return 0;
    });

    return result;
  }, [productAnalytics.list, search, sortBy]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#10243A]">Product Analytics</h1>
        <p className="text-xs text-slate-500">
          Analyze equipment demand, volume contribution and selling price distributions.
        </p>
      </div>

      {/* Required Disclaimer Notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60 text-xs text-sky-900">
        <Info size={18} className="text-[#60A5FA] shrink-0 mt-0.5" />
        <p>
          <strong>Product Performance Note:</strong> Products are analyzed based on sales volume and top-line revenue generated. Because purchase cost prices are not recorded in this sales register, product margins and net profitability are not calculated.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Catalog Items Sold"
          value={productAnalytics.totalDistinctItems.toString()}
          subtitle="Distinct items in period"
          icon={Package}
          badge={{ text: 'Product lines', type: 'teal' }}
        />
        <KpiCard
          title="Total Units Sold"
          value={formatNumber(productAnalytics.totalUnits, 1)}
          subtitle="Total equipment quantity"
          icon={Layers}
          badge={{ text: 'Equipment', type: 'neutral' }}
        />
        <KpiCard
          title="Total Product Sales"
          value={formatCurrency(productAnalytics.totalRevenue)}
          subtitle="Combined sales value"
          icon={DollarSign}
          badge={{ text: 'Gross sales', type: 'teal' }}
        />
      </div>

      {/* Part Number Inconsistency Audit Warning (if any) */}
      {productAnalytics.inconsistentPartNumbers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle size={16} className="text-amber-600" />
            <span>Part Number Audit Alert: Inconsistent product names detected</span>
          </div>
          <p className="text-amber-800">
            The following part numbers appear with multiple item names in the register:
          </p>
          <ul className="list-disc list-inside space-y-1 text-amber-900 font-medium pl-2">
            {productAnalytics.inconsistentPartNumbers.map((entry) => (
              <li key={entry.partNumber}>
                <span className="font-mono font-bold">{entry.partNumber}</span>:{' '}
                {entry.items.join(' vs. ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Searchable Product Performance Table */}
      <div className="bg-white rounded-2xl border border-[#e6eaf0] shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#10243A]">Product Catalog Performance</h2>
            <p className="text-xs text-slate-500">
              Rank products by revenue, units sold or average selling rate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search product or part #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="units">Sort by Units Sold</option>
              <option value="avg_rate">Sort by Avg Rate</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Part #</th>
                <th className="py-2.5 px-3 text-right">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Avg Rate (₦)</th>
                <th className="py-2.5 px-3 text-right">Rate Range (₦)</th>
                <th className="py-2.5 px-3 text-right">Revenue (₦)</th>
                <th className="py-2.5 px-3 text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedProducts.map((p) => (
                <tr key={p.item} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-semibold text-[#10243A]">
                    {p.item}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {p.part_number || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                    {formatNumber(p.units, 1)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {formatCurrency(p.averageRate)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                    {p.minRate === p.maxRate
                      ? formatCurrency(p.minRate)
                      : `${formatCurrency(p.minRate)} – ${formatCurrency(p.maxRate)}`}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#10243A]">
                    {formatCurrency(p.revenue)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-semibold text-[#0D9488]">
                      {p.share.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
