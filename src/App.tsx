import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SalesProvider, useSales } from './context/SalesContext';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { SalesRecordsPage } from './pages/SalesRecordsPage';
import { CustomerAnalyticsPage } from './pages/CustomerAnalyticsPage';
import { ProductAnalyticsPage } from './pages/ProductAnalyticsPage';
import { ImportDataPage } from './pages/ImportDataPage';
import { LoginPage } from './pages/LoginPage';
import { FileSpreadsheet, RotateCcw } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { sales, loading, resetDemoData } = useSales();
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#10243A]">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-8 h-8 border-3 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-300">
            Loading FirstOption Solar Dashboard…
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex bg-[#F5F7FA] text-[#1F2937]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          onOpenMobile={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Empty Database State Notice */}
          {sales.length === 0 && !loading && currentPage !== 'import' && (
            <div className="mb-8 p-6 rounded-3xl bg-white border border-[#e6eaf0] shadow-sm text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center mx-auto">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#10243A]">
                  Database is currently empty
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  No sales transactions have been loaded yet. You can import your sales spreadsheet or load the verified company records.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentPage('import')}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-sm"
                >
                  Go to Import Data
                </button>
                <button
                  onClick={resetDemoData}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  <RotateCcw size={13} />
                  <span>Load Verified 203 Sales Records</span>
                </button>
              </div>
            </div>
          )}

          {/* Page Routing */}
          {currentPage === 'overview' && <OverviewPage />}
          {currentPage === 'sales' && <SalesRecordsPage />}
          {currentPage === 'customers' && <CustomerAnalyticsPage />}
          {currentPage === 'products' && <ProductAnalyticsPage />}
          {currentPage === 'import' && <ImportDataPage />}
        </main>

        {/* Global Footer */}
        <footer className="px-4 sm:px-8 py-5 border-t border-[#e6eaf0] text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div>
            FirstOption Solar Energy Company · Sales Intelligence Dashboard
          </div>
          <div>Currency: Nigerian Naira (₦) · Built with React & Supabase</div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SalesProvider>
        <DashboardContent />
      </SalesProvider>
    </AuthProvider>
  );
}
