import React, { useState } from 'react';
import { SlidersHorizontal, Filter } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { FilterState } from '../types';

export const Filters: React.FC = () => {
  const { filters, setFilters, resetFilters, sales, filteredSales } = useSales();

  // Local draft state so users can click "Apply filters" or edit directly
  const [draft, setDraft] = useState<FilterState>(filters);

  // Sync draft if external filters reset
  React.useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFilters(draft);
  };

  const handleClear = () => {
    resetFilters();
  };

  const availableYears = React.useMemo(() => {
    const years = new Set<string>();
    sales.forEach((s) => {
      if (s.date) {
        const y = s.date.split('-')[0];
        if (y) years.add(y);
      }
    });
    return Array.from(years).sort().reverse();
  }, [sales]);

  const categories = ['All categories', 'End User', 'Installer', 'Corporate', 'Online', 'Partner'];
  const statuses = ['All statuses', 'New', 'Returning'];
  const months = [
    { val: 'all', label: 'All months' },
    { val: '1', label: 'January' },
    { val: '2', label: 'February' },
    { val: '3', label: 'March' },
    { val: '4', label: 'April' },
    { val: '5', label: 'May' },
    { val: '6', label: 'June' },
    { val: '7', label: 'July' },
    { val: '8', label: 'August' },
    { val: '9', label: 'September' },
    { val: '10', label: 'October' },
    { val: '11', label: 'November' },
    { val: '12', label: 'December' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e6eaf0] shadow-sm p-5 sm:p-6 mb-8">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <SlidersHorizontal className="w-5 h-5 text-[#0D9488]" />
        <div>
          <h2 className="text-base font-bold text-[#10243A]">Filters</h2>
          <p className="text-xs text-slate-500">Apply consistently across analytics</p>
        </div>
      </div>

      <form onSubmit={handleApply} className="space-y-4">
        {/* Top inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* From Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              From date
            </label>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              To date
            </label>
            <input
              type="date"
              value={draft.endDate}
              onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Year
            </label>
            <select
              value={draft.year}
              onChange={(e) => setDraft({ ...draft, year: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            >
              <option value="all">All years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Month
            </label>
            <select
              value={draft.month}
              onChange={(e) => setDraft({ ...draft, month: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            >
              {months.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Customer category
            </label>
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            >
              {categories.map((c) => (
                <option key={c} value={c === 'All categories' ? 'all' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Customer status
            </label>
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            >
              {statuses.map((s) => (
                <option key={s} value={s === 'All statuses' ? 'all' : s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search row */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Search customer / product / invoice
          </label>
          <input
            type="text"
            placeholder="Type to filter..."
            value={draft.search}
            onChange={(e) => setDraft({ ...draft, search: e.target.value })}
            className="w-full sm:w-80 text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
          />
        </div>

        {/* Action bar matching screenshot */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-[#10243A]">{filteredSales.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{sales.length}</span> available records
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-lg shadow-sm transition-colors"
            >
              <Filter size={14} />
              <span>Apply filters</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
