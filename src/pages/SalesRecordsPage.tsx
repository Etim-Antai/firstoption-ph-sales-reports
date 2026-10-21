import React, { useState, useMemo } from 'react';
import {
  Plus,
  Download,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { useAuth } from '../context/AuthContext';
import { SaleRecord } from '../types';
import { formatCurrency, formatDisplayDate } from '../utils/formatters';
import { exportRecordsToCSV } from '../utils/importParser';
import { SaleModal } from '../components/SaleModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

type SortField = 'date' | 'customer' | 'total' | 'quantity';
type SortOrder = 'asc' | 'desc';

export const SalesRecordsPage: React.FC = () => {
  const { filteredSales, createRecord, updateRecord, deleteRecord } = useSales();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SaleRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<SaleRecord | null>(null);

  const displayedRecords = useMemo(() => {
    let list = [...filteredSales];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.customer.toLowerCase().includes(q) ||
          r.invoice_number.toLowerCase().includes(q) ||
          r.sales_order_id.toLowerCase().includes(q) ||
          r.item.toLowerCase().includes(q) ||
          r.part_number.toLowerCase().includes(q) ||
          r.contact.toLowerCase().includes(q) ||
          r.remark.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'total' || sortField === 'quantity') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredSales, search, sortField, sortOrder]);

  const totalPages = Math.ceil(displayedRecords.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return displayedRecords.slice(start, start + pageSize);
  }, [displayedRecords, page, pageSize]);

  const totalRevenue = useMemo(() => {
    return displayedRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  }, [displayedRecords]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const csv = exportRecordsToCSV(displayedRecords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `firstoption-solar-sales-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveRecord = async (data: Omit<SaleRecord, 'id'>) => {
    if (editingRecord) {
      await updateRecord(editingRecord.id, data);
    } else {
      await createRecord(data);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#10243A]">Sales Transactions</h1>
          <p className="text-xs text-slate-500">
            Search, filter, edit and maintain all 13 fields of the sales register.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {isAdmin ? (
            <button
              onClick={() => {
                setEditingRecord(null);
                setIsAddEditOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-sm transition-colors"
            >
              <Plus size={16} />
              <span>Add Record</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200/60 font-medium">
              <ShieldAlert size={14} />
              <span>Read-only viewer</span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Table Container */}
      <div className="bg-white rounded-2xl border border-[#e6eaf0] shadow-sm overflow-hidden">
        {/* Table Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by customer, invoice, item, part #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Rows per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* 13-Column Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('customer')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">Invoice #</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Order ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Contact</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Category</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Item Description</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Part #</th>
                <th
                  onClick={() => handleSort('quantity')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 text-right whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Qty</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Rate (₦)</th>
                <th
                  onClick={() => handleSort('total')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 text-right whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total (₦)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">Remark</th>
                {isAdmin && <th className="py-3 px-3.5 text-center whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 14 : 13}
                    className="py-12 text-center text-slate-400 text-xs"
                  >
                    No sales transactions match the current search or filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3.5 text-slate-600 whitespace-nowrap">
                      {formatDisplayDate(r.date)}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-[#10243A] whitespace-nowrap">
                      {r.customer}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {r.invoice_number || '-'}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {r.sales_order_id || '-'}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 whitespace-nowrap">
                      {r.contact || '-'}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md font-medium text-[11px] bg-slate-100 text-slate-700">
                        {r.customer_category || 'End User'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          (r.status || '').toLowerCase() === 'new'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.status || 'Returning'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-800 font-medium max-w-xs truncate" title={r.item}>
                      {r.item}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {r.part_number || '-'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-medium text-slate-700 whitespace-nowrap">
                      {r.quantity}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-600 whitespace-nowrap">
                      {formatCurrency(r.rate)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-[#10243A] whitespace-nowrap">
                      {formatCurrency(r.total)}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-400 text-[11px] max-w-[120px] truncate" title={r.remark}>
                      {r.remark || '-'}
                    </td>
                    {isAdmin && (
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingRecord(r);
                              setIsAddEditOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-[#0D9488] hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(r)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with totals and pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-[#10243A]">{paginatedRows.length}</span> of{' '}
            <span className="font-bold text-[#10243A]">{displayedRecords.length}</span> filtered transactions · Filtered Total:{' '}
            <span className="font-extrabold text-[#0D9488]">{formatCurrency(totalRevenue)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-slate-700 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <SaleModal
        isOpen={isAddEditOpen}
        initialData={editingRecord}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingRecord)}
        sale={deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={async () => {
          if (deletingRecord) {
            await deleteRecord(deletingRecord.id);
            setDeletingRecord(null);
          }
        }}
      />
    </div>
  );
};
