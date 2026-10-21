import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { SaleRecord } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DeleteConfirmModalProps {
  sale: SaleRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  sale,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [busy, setBusy] = useState(false);

  if (!isOpen || !sale) return null;

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10243A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#10243A]">Delete Transaction?</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 mb-5">
          <div className="text-slate-500">
            Customer: <span className="font-semibold text-slate-800">{sale.customer}</span>
          </div>
          <div className="text-slate-500">
            Item: <span className="font-semibold text-slate-800">{sale.item}</span>
          </div>
          <div className="text-slate-500">
            Total: <span className="font-bold text-[#10243A]">{formatCurrency(sale.total)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm disabled:opacity-50"
          >
            {busy ? 'Deleting…' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
};
