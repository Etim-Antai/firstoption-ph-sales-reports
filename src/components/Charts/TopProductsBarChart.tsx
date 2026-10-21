import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ProductSummary } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface TopProductsBarChartProps {
  data: ProductSummary[];
}

export const TopProductsBarChart: React.FC<TopProductsBarChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<'revenue' | 'units'>('revenue');

  const topItems = React.useMemo(() => {
    const sorted = [...data].sort((a, b) => (metric === 'revenue' ? b.revenue - a.revenue : b.units - a.units));
    return sorted.slice(0, 6);
  }, [data, metric]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as ProductSummary;
      return (
        <div className="bg-[#10243A] text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700 max-w-xs">
          <div className="font-bold text-[#60A5FA] capitalize">{item.item}</div>
          {item.part_number && (
            <div className="text-[10px] text-slate-400">Part No: {item.part_number}</div>
          )}
          <div>
            Revenue: <span className="font-semibold text-white">{formatCurrency(item.revenue)}</span>
          </div>
          <div>
            Units sold: <span className="font-semibold text-slate-300">{formatNumber(item.units, 1)}</span>
          </div>
          <div>
            Avg Rate: <span className="font-semibold text-slate-300">{formatCurrency(item.average_rate)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e6eaf0] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,36,58,0.035)] flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-[#10243A]">Top-selling products</h2>
          <p className="text-xs text-slate-500">Highest contribution to sales</p>
        </div>

        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as 'revenue' | 'units')}
          className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20"
        >
          <option value="revenue">Revenue (₦)</option>
          <option value="units">Units sold</option>
        </select>
      </div>

      <div className="h-64 w-full">
        {topItems.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No products found
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topItems}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDF2F7" />
              <XAxis
                type="number"
                tickFormatter={(val) => (metric === 'revenue' ? formatCurrency(val, true) : `${val}`)}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#718096', fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="item"
                width={110}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val.length > 16 ? `${val.slice(0, 16)}…` : val)}
                tick={{ fill: '#4A5568', fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={metric} radius={[0, 6, 6, 0]} maxBarSize={22}>
                {topItems.map((_, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={index === 0 ? '#0D9488' : index === 1 ? '#14B8A6' : '#60A5FA'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
