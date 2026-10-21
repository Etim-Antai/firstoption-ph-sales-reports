import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategorySummary } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CategoryPieChartProps {
  data: CategorySummary[];
}

const CATEGORY_COLORS = ['#0D9488', '#60A5FA', '#10243A', '#F59E0B', '#A78BFA', '#64748B'];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CategorySummary;
      return (
        <div className="bg-[#10243A] text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
          <div className="font-bold text-[#60A5FA]">{item.category}</div>
          <div>
            Revenue: <span className="font-semibold text-white">{formatCurrency(item.revenue)}</span>
          </div>
          <div>
            Share: <span className="font-semibold text-emerald-400">{item.share.toFixed(1)}%</span>
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
      <div>
        <h2 className="text-base font-bold text-[#10243A]">Revenue by category</h2>
        <p className="text-xs text-slate-500">Customer category contribution</p>
      </div>

      <div className="h-56 w-full my-3">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No category data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Breakdown list */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {data.map((cat, idx) => (
          <div key={cat.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
              />
              <span className="font-medium text-slate-700 truncate">{cat.category}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-bold text-[#10243A]">{formatCurrency(cat.revenue)}</span>
              <span className="font-semibold text-slate-400 w-12 text-right">
                {cat.share.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
