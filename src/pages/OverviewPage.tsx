import React from 'react';
import { DollarSign, Layers, Users, ShoppingBag, TrendingUp, UserPlus, Clock } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { Filters } from '../components/Filters';
import { KpiCard } from '../components/KpiCard';
import { RevenueOverTimeChart } from '../components/Charts/RevenueOverTimeChart';
import { CategoryPieChart } from '../components/Charts/CategoryPieChart';
import { TopProductsBarChart } from '../components/Charts/TopProductsBarChart';
import { WeekdaySalesChart } from '../components/Charts/WeekdaySalesChart';
import { NewVsReturningChart } from '../components/Charts/NewVsReturningChart';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const OverviewPage: React.FC = () => {
  const { kpis, monthlyData, categoryData, topProducts, weekdayData, customerStatusData } = useSales();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Brand Hero Banner matching screenshot */}
      <div>
        <div className="text-xs font-bold tracking-wider uppercase text-[#0D9488]">
          FirstOption Solar Energy Company
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#10243A]">
          Good business starts with a clear view.
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Monitor revenue, customer activity and product demand in one place.
        </p>
      </div>

      {/* Global Filter Bar */}
      <Filters />

      {/* Performance Snapshot KPI Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#10243A]">Performance snapshot</h2>
            <p className="text-xs text-slate-500">Key metrics from the selected sales records</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={14} className="text-[#0D9488]" />
            <span>Up to date</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Total Revenue"
            value={formatCurrency(kpis.totalRevenue)}
            subtitle="Sum of valid totals"
            icon={DollarSign}
            badge={{ text: 'Verified', type: 'teal' }}
          />

          <KpiCard
            title="Total Units Sold"
            value={formatNumber(kpis.totalUnits, 1)}
            subtitle="Sum of quantities"
            icon={Layers}
            badge={{ text: 'Units', type: 'neutral' }}
          />

          <KpiCard
            title="Unique Customers"
            value={kpis.uniqueCustomers.toLocaleString()}
            subtitle="Distinct identities"
            icon={Users}
            badge={{ text: 'Active', type: 'neutral' }}
          />

          <KpiCard
            title="Sales Invoices"
            value={kpis.uniqueInvoices.toLocaleString()}
            subtitle="Distinct invoice IDs"
            icon={ShoppingBag}
            badge={{ text: 'Invoices', type: 'neutral' }}
          />

          <KpiCard
            title="Avg Order Value"
            value={formatCurrency(kpis.averageOrderValue)}
            subtitle="Revenue / distinct orders"
            icon={TrendingUp}
            badge={{ text: 'Per order', type: 'teal' }}
          />

          <KpiCard
            title="New Customers"
            value={kpis.newCustomers.toLocaleString()}
            subtitle="First-time buyers"
            icon={UserPlus}
            badge={{ text: 'Acquisition', type: 'success' }}
          />
        </div>
      </div>

      {/* Row 1: Revenue Over Time Full Width Area Chart */}
      <RevenueOverTimeChart data={monthlyData} />

      {/* Row 2: Category Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={categoryData} />
        <TopProductsBarChart data={topProducts} />
      </div>

      {/* Row 3: Weekday Sales & Customer Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeekdaySalesChart data={weekdayData} />
        <NewVsReturningChart data={customerStatusData} />
      </div>
    </div>
  );
};
