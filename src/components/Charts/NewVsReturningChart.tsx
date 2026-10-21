import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface NewVsReturningChartProps {
  data: {
    newCustomersCount: number;
    newRevenue: number;
    returningCustomersCount: number;
    returningRevenue: number;
  };
}

export const NewVsReturningChart: React.FC<NewVsReturningChartProps> = ({ data }) => {
  const totalRev = data.newRevenue + data.returningRevenue;
  const newRevPct = totalRev > 0 ? (data.newRevenue / totalRev) * 100 : 0;
  const retRevPct = totalRev > 0 ? (data.returningRevenue / totalRev) * 100 : 0;

  const totalCust = data.newCustomersCount + data.returningCustomersCount;
  const newCustPct = totalCust > 0 ? (data.newCustomersCount / totalCust) * 100 : 0;
  const retCustPct = totalCust > 0 ? (data.returningCustomersCount / totalCust) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#e6eaf0] p-5 sm:p-6 shadow-[0_2px_10px_rgba(16,36,58,0.035)] flex flex-col justify-between">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#10243A]">New vs returning customers</h2>
        <p className="text-xs text-slate-500">Customer segment comparison</p>
      </div>

      <div className="space-y-5 my-2">
        {/* Revenue progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-600">Revenue Contribution</span>
            <span className="text-slate-400 font-medium">Total: {formatCurrency(totalRev)}</span>
          </div>
          <div className="h-4 rounded-full bg-slate-100 flex overflow-hidden">
            <div
              style={{ width: `${retRevPct}%` }}
              className="bg-[#10243A] h-full transition-all duration-500"
              title={`Returning: ${formatCurrency(data.returningRevenue)} (${retRevPct.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${newRevPct}%` }}
              className="bg-[#0D9488] h-full transition-all duration-500"
              title={`New: ${formatCurrency(data.newRevenue)} (${newRevPct.toFixed(1)}%)`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10243A]" />
              Returning: <b className="text-slate-700">{formatCurrency(data.returningRevenue)}</b> ({retRevPct.toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
              New: <b className="text-slate-700">{formatCurrency(data.newRevenue)}</b> ({newRevPct.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Customer count progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-600">Customer Count</span>
            <span className="text-slate-400 font-medium">Distinct: {totalCust}</span>
          </div>
          <div className="h-4 rounded-full bg-slate-100 flex overflow-hidden">
            <div
              style={{ width: `${retCustPct}%` }}
              className="bg-[#60A5FA] h-full transition-all duration-500"
              title={`Returning: ${data.returningCustomersCount} (${retCustPct.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${newCustPct}%` }}
              className="bg-[#14B8A6] h-full transition-all duration-500"
              title={`New: ${data.newCustomersCount} (${newCustPct.toFixed(1)}%)`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
              Returning: <b className="text-slate-700">{data.returningCustomersCount}</b> ({retCustPct.toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
              New: <b className="text-slate-700">{data.newCustomersCount}</b> ({newCustPct.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        Classified based on register status indicator (New vs Existing/Returning).
      </div>
    </div>
  );
};
