import React from 'react';
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
import { WeekdaySummary } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface WeekdaySalesChartProps {
  data: WeekdaySummary[];
}

export const WeekdaySalesChart: React.FC<WeekdaySalesChartProps> = ({ data }) => {
  const maxDay = React.useMemo(() => {
    let max = 0;
    let name = '';
    data.forEach((d) => {
      if (d.revenue > max) {
        max = d.revenue;
        name = d.day;
      }
    });
    return { name, amount: max };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as WeekdaySummary;
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
    <div className="bg-white rounded-2xl border border-[#e6eaf0] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,36,58,0.035)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-[#10243A]">Sales by day of week</h2>
          <p className="text-xs text-slate-500">Weekly revenue distribution</p>
        </div>
        {maxDay.name && (
          <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Peak: <span className="font-bold">{maxDay.name}</span>
          </div>
        )}
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
            <XAxis
              dataKey="day"
              tickFormatter={(v) => v.slice(0, 3)}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#718096', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrency(v, true)}
              tick={{ fill: '#718096', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.day === maxDay.name ? '#0D9488' : '#60A5FA'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
