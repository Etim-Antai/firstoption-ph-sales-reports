import React, { useState, useMemo } from 'react';
import { Users, UserPlus, DollarSign, Repeat, Search, ArrowRight } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { KpiCard } from '../components/KpiCard';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const CustomerAnalyticsPage: React.FC = () => {
  const { sales, filteredSales } = useSales();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Aggregate customer metrics
  const customerStats = useMemo(() => {
    const map: Record<
      string,
      {
        customer: string;
        contact: string;
        category: string;
        status: string;
        totalRevenue: number;
        totalUnits: number;
        invoices: Set<string>;
        firstDate: string;
        lastDate: string;
      }
    > = {};

    let totalRev = 0;
    const newCust = new Set<string>();
    const returningCust = new Set<string>();

    filteredSales.forEach((r) => {
      const name = (r.customer || '').trim();
      if (!name) return;
      const key = name.toLowerCase();

      if (!map[key]) {
        map[key] = {
          customer: name,
          contact: r.contact || '',
          category: r.customer_category || 'End User',
          status: r.status || 'Returning',
          totalRevenue: 0,
          totalUnits: 0,
          invoices: new Set(),
          firstDate: r.date,
          lastDate: r.date,
        };
      }

      const rev = Number(r.total) || 0;
      const qty = Number(r.quantity) || 0;
      map[key].totalRevenue += rev;
      map[key].totalUnits += qty;
      totalRev += rev;
      if (r.invoice_number) map[key].invoices.add(r.invoice_number);
      if (r.date < map[key].firstDate) map[key].firstDate = r.date;
      if (r.date > map[key].lastDate) map[key].lastDate = r.date;

      const st = (r.status || '').toLowerCase().trim();
      if (st === 'new') {
        newCust.add(key);
      } else {
        returningCust.add(key);
      }
    });

    const list = Object.values(map);
    const repeatBuyers = list.filter((c) => c.invoices.size > 1).length;
    const repeatRate = list.length > 0 ? (repeatBuyers / list.length) * 100 : 0;
    const avgRevPerCust = list.length > 0 ? totalRev / list.length : 0;

    return {
      list,
      totalCustomers: list.length,
      newCustomersCount: newCust.size,
      returningCustomersCount: returningCust.size,
      avgRevPerCust,
      repeatRate,
      repeatBuyers,
    };
  }, [filteredSales]);

  // Top 10 by Revenue
  const topByRevenue = useMemo(() => {
    return [...customerStats.list]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }, [customerStats.list]);

  // Top 10 by Units
  const topByUnits = useMemo(() => {
    return [...customerStats.list]
      .sort((a, b) => b.totalUnits - a.totalUnits)
      .slice(0, 10);
  }, [customerStats.list]);

  // Filtered customer table
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customerStats.list;
    const q = search.toLowerCase().trim();
    return customerStats.list.filter(
      (c) =>
        c.customer.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.contact.includes(q)
    );
  }, [customerStats.list, search]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#10243A]">Customer Analytics</h1>
        <p className="text-xs text-slate-500">
          Understand customer purchasing patterns, retention, and high-value buyers.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Customers"
          value={customerStats.totalCustomers.toString()}
          subtitle="Distinct client identities"
          icon={Users}
          badge={{ text: 'Active in period', type: 'teal' }}
        />
        <KpiCard
          title="New vs Returning"
          value={`${customerStats.newCustomersCount} / ${customerStats.returningCustomersCount}`}
          subtitle="New vs Returning buyers"
          icon={UserPlus}
          badge={{ text: 'Acquisition', type: 'neutral' }}
        />
        <KpiCard
          title="Avg Revenue / Customer"
          value={formatCurrency(customerStats.avgRevPerCust)}
          subtitle="Total revenue / active customers"
          icon={DollarSign}
          badge={{ text: 'Per client', type: 'teal' }}
        />
        <KpiCard
          title="Repeat Purchase Rate"
          value={`${customerStats.repeatRate.toFixed(1)}%`}
          subtitle={`${customerStats.repeatBuyers} clients with >1 invoice`}
          icon={Repeat}
          badge={{ text: 'Retention', type: 'success' }}
        />
      </div>

      {/* Top 10 by Revenue & Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Revenue */}
        <div className="bg-white rounded-2xl border border-[#e6eaf0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#10243A]">Top 10 Customers by Revenue</h2>
              <p className="text-xs text-slate-400">Ranked by total spend (₦)</p>
            </div>
            <span className="text-xs font-semibold text-[#0D9488]">₦ Highest</span>
          </div>

          <div className="space-y-2.5">
            {topByRevenue.map((c, i) => (
              <div
                key={c.customer}
                onClick={() => setSelectedCustomer(c.customer)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs font-bold text-slate-400 group-hover:text-[#0D9488]">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0D9488]">
                      {c.customer}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {c.category} · {c.invoices.size} invoice(s)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#10243A]">
                    {formatCurrency(c.totalRevenue)}
                  </span>
                  <ArrowRight size={13} className="text-slate-300 group-hover:text-[#0D9488]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Units */}
        <div className="bg-white rounded-2xl border border-[#e6eaf0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#10243A]">Top 10 Customers by Units</h2>
              <p className="text-xs text-slate-400">Ranked by total equipment purchased</p>
            </div>
            <span className="text-xs font-semibold text-[#60A5FA]">Qty Highest</span>
          </div>

          <div className="space-y-2.5">
            {topByUnits.map((c, i) => (
              <div
                key={c.customer}
                onClick={() => setSelectedCustomer(c.customer)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs font-bold text-slate-400 group-hover:text-[#60A5FA]">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate group-hover:text-[#60A5FA]">
                      {c.customer}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {c.category} · {formatCurrency(c.totalRevenue)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#10243A]">
                    {formatNumber(c.totalUnits, 1)} units
                  </span>
                  <ArrowRight size={13} className="text-slate-300 group-hover:text-[#60A5FA]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Searchable Customer Directory */}
      <div className="bg-white rounded-2xl border border-[#e6eaf0] shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#10243A]">Customer Directory</h2>
            <p className="text-xs text-slate-500">
              Click any customer to view full transaction and invoice history.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Invoices</th>
                <th className="py-2.5 px-3 text-right">Units</th>
                <th className="py-2.5 px-3 text-right">Total Revenue</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.slice(0, 30).map((c) => (
                <tr key={c.customer} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-semibold text-[#10243A]">
                    {c.customer}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        c.status.toLowerCase() === 'new'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                    {c.invoices.size}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {formatNumber(c.totalUnits, 1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#10243A]">
                    {formatCurrency(c.totalRevenue)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => setSelectedCustomer(c.customer)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-colors"
                    >
                      View Orders
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer Modal */}
      <CustomerDetailModal
        customerName={selectedCustomer}
        records={sales}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};
