import React from 'react';
import { X, User, Phone, Tag } from 'lucide-react';
import { SaleRecord } from '../types';
import { formatCurrency, formatDisplayDate } from '../utils/formatters';

interface CustomerDetailModalProps {
  customerName: string | null;
  records: SaleRecord[];
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customerName,
  records,
  onClose,
}) => {
  if (!customerName) return null;

  const customerRecords = records.filter(
    (r) => r.customer?.toLowerCase() === customerName.toLowerCase()
  );

  const totalSpent = customerRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  const totalUnits = customerRecords.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const contact = customerRecords.find((r) => r.contact)?.contact || 'No phone recorded';
  const category = customerRecords[0]?.customer_category || 'Unspecified';
  const status = customerRecords[0]?.status || 'Returning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10243A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-100 p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center font-bold text-lg">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#10243A]">{customerName}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {contact}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Tag size={12} /> {category}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                  {status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Total Spent
            </span>
            <span className="text-base sm:text-lg font-bold text-[#10243A]">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Units Purchased
            </span>
            <span className="text-base sm:text-lg font-bold text-[#10243A]">
              {totalUnits.toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Invoices
            </span>
            <span className="text-base sm:text-lg font-bold text-[#10243A]">
              {customerRecords.length}
            </span>
          </div>
        </div>

        {/* Purchase History Table */}
        <div className="flex-1 overflow-y-auto min-h-0 border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                <th className="py-2.5 px-3 font-semibold">Item Purchased</th>
                <th className="py-2.5 px-3 font-semibold text-right">Qty</th>
                <th className="py-2.5 px-3 font-semibold text-right">Rate</th>
                <th className="py-2.5 px-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {formatDisplayDate(r.date)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                    {r.invoice_number || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{r.item}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{r.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {formatCurrency(r.rate)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#10243A]">
                    {formatCurrency(r.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 mt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
