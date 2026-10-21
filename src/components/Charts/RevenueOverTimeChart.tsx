import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyRevenue } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RevenueOverTimeChartProps {
  data: MonthlyRevenue[];
}

export const RevenueOverTimeChart: React.FC<RevenueOverTimeChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<'revenue' | 'units'>('revenue');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as MonthlyRevenue;
      return (
        <div className="bg-[#10243A] text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
          <div className="font-bold text-[#60A5FA]">{label}</div>
          <div>
            Revenue: <span className="font-semibold text-white">{formatCurrency(item.revenue)}</span>
          </div>
          <div>
            Units sold: <span className="font-semibold text-slate-300">{item.units.toLocaleString()}</span>
          </div>
          <div>
            Transactions: <span className="font-semibold text-slate-300">{item.transactions}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e6eaf0] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,36,58,0.035)]">
      {/* Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-bold text-[#10243A]">Revenue over time</h2>
          <p className="text-xs text-slate-500">Monthly sales value · NGN</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend pill matching screenshot */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
            <span>Revenue</span>
          </div>

          <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs bg-slate-50">
            <button
              onClick={() => setMetric('revenue')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                metric === 'revenue'
                  ? 'bg-white text-[#10243A] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setMetric('units')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                metric === 'units'
                  ? 'bg-white text-[#10243A] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Units
            </button>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No transaction records match the selected date range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueTealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#718096', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (metric === 'revenue' ? formatCurrency(val, true) : `${val}`)}
                tick={{ fill: '#718096', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#0D9488"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueTealGradient)"
                dot={{ r: 3, fill: '#0D9488', strokeWidth: 1, stroke: '#FFFFFF' }}
                activeDot={{ r: 5, fill: '#0D9488', stroke: '#10243A', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
