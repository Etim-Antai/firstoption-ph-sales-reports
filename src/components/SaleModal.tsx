import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { SaleRecord } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<SaleRecord, 'id'>) => Promise<void>;
  initialData?: SaleRecord | null;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<SaleRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    sales_order_id: '',
    contact: '',
    status: 'Returning',
    customer_category: 'End User',
    invoice_number: '',
    item: '',
    part_number: '',
    quantity: 1,
    rate: 0,
    remark: '',
    total: 0,
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || new Date().toISOString().split('T')[0],
        customer: initialData.customer || '',
        sales_order_id: initialData.sales_order_id || '',
        contact: initialData.contact || '',
        status: initialData.status || 'Returning',
        customer_category: initialData.customer_category || 'End User',
        invoice_number: initialData.invoice_number || '',
        item: initialData.item || '',
        part_number: initialData.part_number || '',
        quantity: initialData.quantity ?? 1,
        rate: initialData.rate ?? 0,
        remark: initialData.remark || '',
        total: (initialData.quantity ?? 1) * (initialData.rate ?? 0),
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customer: '',
        sales_order_id: '',
        contact: '',
        status: 'Returning',
        customer_category: 'End User',
        invoice_number: '',
        item: '',
        part_number: '',
        quantity: 1,
        rate: 0,
        remark: '',
        total: 0,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  // Recalculate total whenever quantity or rate changes
  const handleQtyChange = (qty: number) => {
    const q = isNaN(qty) ? 0 : Math.max(0, qty);
    setFormData((prev) => ({
      ...prev,
      quantity: q,
      total: q * prev.rate,
    }));
  };

  const handleRateChange = (rate: number) => {
    const r = isNaN(rate) ? 0 : Math.max(0, rate);
    setFormData((prev) => ({
      ...prev,
      rate: r,
      total: prev.quantity * r,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!formData.item.trim()) {
      setError('Item description is required');
      return;
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    if (formData.rate < 0) {
      setError('Rate cannot be negative');
      return;
    }

    setBusy(true);
    try {
      await onSave({
        ...formData,
        total: formData.quantity * formData.rate,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save sales record');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10243A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-100 p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#10243A]">
              {initialData ? 'Edit Sales Record' : 'Add New Sales Record'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sales transactions are securely stored with automatic total calculation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>

            {/* Customer */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ikechukwu Opara"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="e.g. 08037026047"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>

            {/* Customer Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Customer Category
              </label>
              <select
                value={formData.customer_category}
                onChange={(e) => setFormData({ ...formData, customer_category: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              >
                <option value="End User">End User</option>
                <option value="Installer">Installer</option>
                <option value="Corporate">Corporate</option>
                <option value="Online">Online</option>
                <option value="Partner">Partner</option>
              </select>
            </div>

            {/* Customer Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              >
                <option value="New">New</option>
                <option value="Returning">Returning / Existing</option>
              </select>
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="e.g. 11704"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>

            {/* Sales Order ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Sales Order ID
              </label>
              <input
                type="text"
                placeholder="e.g. SO-2026-001"
                value={formData.sales_order_id}
                onChange={(e) => setFormData({ ...formData, sales_order_id: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>

            {/* Item / Product */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Item Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. itel 6kw/48v hybride inverter"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>

            {/* Part Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Part Number
              </label>
              <input
                type="text"
                placeholder="e.g. ITEL-6KW-INV"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={formData.quantity}
                onChange={(e) => handleQtyChange(parseFloat(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>

            {/* Rate (₦) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Rate (₦) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={formData.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              />
            </div>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Remark / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Delivered with warranty card"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
            />
          </div>

          {/* Calculated Total Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Calculator size={16} className="text-[#0D9488]" />
              <span>Calculated Total (Quantity × Rate):</span>
            </div>
            <div className="text-base font-extrabold text-[#10243A]">
              {formatCurrency(formData.total)}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-lg shadow-sm disabled:opacity-50"
            >
              {busy ? 'Saving…' : initialData ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
