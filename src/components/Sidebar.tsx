import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FileSpreadsheet,
  Shield,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type PageId = 'overview' | 'sales' | 'customers' | 'products' | 'import';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems: { id: PageId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales records', icon: ShoppingCart },
  { id: 'customers', label: 'Customer analytics', icon: Users },
  { id: 'products', label: 'Product analytics', icon: Package },
  { id: 'import', label: 'Import data', icon: FileSpreadsheet },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, isAdmin, isSupabaseConnected, logout, switchRole } = useAuth();

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#10243A] text-white transition-transform duration-300 ease-in-out border-r border-[#1c3550] lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1c3550]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#0e1e30] border border-[#234568] flex items-center justify-center shadow-md">
              <img
                src="./firstoption_logo.jpg"
                alt="FirstOption Solar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = './firstoptionsolar.jpg';
                }}
              />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                FirstOption <span className="text-[#0D9488]">Solar</span>
              </div>
              <div className="text-[11px] font-medium text-[#60A5FA] tracking-wide">
                Sales Intelligence
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c3550] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-[#60A5FA]/70">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onCloseMobile();
                }}
                className={`flex items-center justify-between w-full px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-[#203a50] text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:bg-[#162f49] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={active ? 'text-[#0D9488]' : 'text-slate-400'}
                  />
                  <span>{item.label}</span>
                </div>
                {active && (
                  <span className="w-2 h-2 rounded-full bg-[#0D9488] shadow-[0_0_8px_#0D9488]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Workspace Security & User Status Box */}
        <div className="p-3 border-t border-[#1c3550] space-y-2">
          {/* Workspace card matching screenshot */}
          <div className="p-3 rounded-xl bg-[#162f49] border border-[#234568]">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#0D9488]" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {isSupabaseConnected ? 'Private workspace' : 'Local workspace'}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>{isAdmin ? 'Administrator' : 'Read-only viewer'}</span>
                  <span>·</span>
                  <span className="text-[#60A5FA]">{isSupabaseConnected ? 'Supabase RLS' : 'Sandbox'}</span>
                </div>
              </div>
            </div>

            {/* Quick role toggle for testing admin vs viewer permissions */}
            {!isSupabaseConnected && (
              <div className="mt-2.5 pt-2 border-t border-[#234568] flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Test Role:</span>
                <button
                  onClick={() => switchRole(isAdmin ? 'viewer' : 'admin')}
                  className="px-2 py-0.5 rounded bg-[#203a50] text-[#60A5FA] hover:text-white font-medium"
                  title="Switch between Admin (full CRUD) and Viewer (read-only)"
                >
                  {isAdmin ? 'Switch to Viewer' : 'Switch to Admin'}
                </button>
              </div>
            )}
          </div>

          {/* User & Sign Out Button */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="text-xs text-slate-300 truncate max-w-[130px]">
              <div className="font-semibold text-white truncate">{user?.name || 'Staff User'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-red-400 rounded-lg hover:bg-[#162f49] transition-colors"
              title="Sign out of dashboard"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>

          <div className="text-center text-[10px] font-medium text-slate-500 pt-1 tracking-wider">
            FIRSTOPTION SOLAR · v1.0
          </div>
        </div>
      </aside>
    </>
  );
};
