import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import { PageId } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useSales } from '../context/SalesContext';

interface HeaderProps {
  currentPage: PageId;
  onOpenMobile: () => void;
}

const pageTitles: Record<PageId, { title: string; breadcrumb: string }> = {
  overview: { title: 'Sales overview', breadcrumb: 'Workspace / Overview' },
  sales: { title: 'Sales records', breadcrumb: 'Workspace / Sales records' },
  customers: { title: 'Customer analytics', breadcrumb: 'Workspace / Customers' },
  products: { title: 'Product analytics', breadcrumb: 'Workspace / Products' },
  import: { title: 'Import data', breadcrumb: 'Workspace / Import data' },
};

export const Header: React.FC<HeaderProps> = ({ currentPage, onOpenMobile }) => {
  const { user, isSupabaseConnected } = useAuth();
  const { refresh, loading } = useSales();
  const info = pageTitles[currentPage];

  // User initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'FO';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-white/90 backdrop-blur-md border-b border-[#e6eaf0]">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="text-xs font-semibold text-slate-400">
            {info.breadcrumb}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#10243A]">
            {info.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Refresh button */}
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-[#0D9488] hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          title="Refresh dataset"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* Live data status pill matching screenshot */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isSupabaseConnected ? 'Live Supabase' : 'Live data'}</span>
        </div>

        {/* User avatar circle */}
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#10243A] text-white font-bold text-xs shadow-sm ring-2 ring-slate-100"
          title={`${user?.name} (${user?.role})`}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};
