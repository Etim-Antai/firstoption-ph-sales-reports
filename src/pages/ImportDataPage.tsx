import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { useAuth } from '../context/AuthContext';
import {
  parseFileForImport,
  generateRejectedCSV,
  generateTemplateCSV,
} from '../utils/importParser';
import { ImportValidationResult, SaleRecord } from '../types';
import { formatCurrency, formatDisplayDate } from '../utils/formatters';

export const ImportDataPage: React.FC = () => {
  const { sales, importRecords } = useSales();
  const { isAdmin } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Validation output
  const [results, setResults] = useState<ImportValidationResult[]>([]);
  const [validRows, setValidRows] = useState<Partial<SaleRecord>[]>([]);
  const [rejectedRows, setRejectedRows] = useState<{ rowNumber: number; data: any; errors: string[] }[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [discrepancyCount, setDiscrepancyCount] = useState(0);

  // Import submission
  const [importing, setImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setParseError(null);
    setImportSuccessMessage(null);
    setParsing(true);

    try {
      const parsed = await parseFileForImport(selected, sales);
      setResults(parsed.results);
      setValidRows(parsed.validRows);
      setRejectedRows(parsed.rejectedRows);
      setDuplicateCount(parsed.duplicateCount);
      setDiscrepancyCount(parsed.discrepancyCount);
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse file');
      setResults([]);
      setValidRows([]);
      setRejectedRows([]);
    } finally {
      setParsing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = generateTemplateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'firstoption-sales-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadRejected = () => {
    if (rejectedRows.length === 0) return;
    const csv = generateRejectedCSV(rejectedRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rejected-sales-rows-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCommitImport = async () => {
    if (!file || validRows.length === 0) return;
    setImporting(true);
    setParseError(null);

    try {
      const res = await importRecords(validRows, file.name);
      setImportSuccessMessage(
        `Successfully imported ${res.inserted} transactions from "${file.name}". Existing database records were preserved.`
      );
      // Reset staging
      setFile(null);
      setResults([]);
      setValidRows([]);
      setRejectedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setParseError(err.message || 'Import failed to complete');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="text-xs font-bold tracking-wider uppercase text-[#0D9488]">
          FirstOption Solar Energy Company
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#10243A]">
          Import data
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Validate your sales file before importing records.
        </p>
      </div>

      {/* Success Notice */}
      {importSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{importSuccessMessage}</span>
          </div>
          <button
            onClick={() => setImportSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notice */}
      {parseError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600 shrink-0" />
            <span>{parseError}</span>
          </div>
          <button
            onClick={() => setParseError(null)}
            className="text-red-600 hover:text-red-900 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top 2 Columns matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e6eaf0] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#0D9488]/10 text-[#0D9488]">
                <Upload size={22} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#10243A]">Import sales register</h2>
                <p className="text-xs text-slate-500">
                  Upload your company sales register as CSV or Excel (.xlsx). Existing records are not deleted.
                </p>
              </div>
            </div>

            {/* Dashed dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 border-2 border-dashed border-[#0D9488]/30 hover:border-[#0D9488] bg-slate-50/60 hover:bg-[#0D9488]/5 rounded-2xl p-8 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 rounded-full bg-emerald-100 text-emerald-700">
                    <FileSpreadsheet size={28} />
                  </div>
                  <div className="text-sm font-bold text-[#10243A]">{file.name}</div>
                  <div className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB · Click to choose a different file
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 rounded-full bg-slate-100 text-slate-500">
                    <FileSpreadsheet size={28} />
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                    Click to select CSV or Excel file
                  </div>
                  <div className="text-xs text-slate-400">
                    Supports data.csv, .xlsx, and .xls spreadsheets up to 25MB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <Download size={14} />
              <span>Download CSV Template</span>
            </button>

            {parsing && (
              <div className="flex items-center gap-2 text-xs text-[#0D9488] font-semibold">
                <RefreshCw size={14} className="animate-spin" />
                <span>Validating file rows…</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "Before you import" guidance card matching screenshot (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e6eaf0] p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#10243A]">Before you import</h2>
          <p className="text-xs text-slate-500 mb-5">Expected column structure and verification rules</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2 py-0.5 rounded">
                01
              </span>
              <div>
                <div className="text-xs font-bold text-slate-800">Required columns</div>
                <div className="text-[11px] text-slate-500">
                  Date, Customer, Item, Quantity and Rate are mandatory.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2 py-0.5 rounded">
                02
              </span>
              <div>
                <div className="text-xs font-bold text-slate-800">Totals are checked</div>
                <div className="text-[11px] text-slate-500">
                  Each total is recalculated as Quantity × Rate. Discrepancies are flagged in the preview.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2 py-0.5 rounded">
                03
              </span>
              <div>
                <div className="text-xs font-bold text-slate-800">Duplicates are handled carefully</div>
                <div className="text-[11px] text-slate-500">
                  Exact matching rows are flagged; legitimate repeat purchases remain for review.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="font-mono text-xs font-bold text-[#0D9488] bg-[#0D9488]/10 px-2 py-0.5 rounded">
                04
              </span>
              <div>
                <div className="text-xs font-bold text-slate-800">Keep identifiers as text</div>
                <div className="text-[11px] text-slate-500">
                  Preserves leading zeros on invoice numbers, order IDs and phone contacts.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Preview Section (shown after file is selected) */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e6eaf0] p-6 shadow-sm space-y-5">
          {/* Summary stats pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#10243A]">File Validation Results</h2>
              <p className="text-xs text-slate-500">
                Found {results.length} total rows in "{file?.name}"
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                {validRows.length} Valid Rows
              </span>

              {rejectedRows.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 font-bold text-xs flex items-center gap-1.5">
                  <XCircle size={14} className="text-red-600" />
                  {rejectedRows.length} Rejected Rows
                </span>
              )}

              {discrepancyCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                  {discrepancyCount} Total Discrepancies
                </span>
              )}

              {duplicateCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                  {duplicateCount} Potential Duplicates
                </span>
              )}
            </div>
          </div>

          {/* Download Rejected Rows Button */}
          {rejectedRows.length > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs">
              <div className="text-red-800">
                <strong>Attention:</strong> {rejectedRows.length} rows have missing or invalid fields and cannot be imported automatically.
              </div>
              <button
                onClick={handleDownloadRejected}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                <Download size={13} />
                <span>Download Rejected Rows (CSV)</span>
              </button>
            </div>
          )}

          {/* Row-level preview table */}
          <div className="overflow-x-auto max-h-80 border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Row</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.slice(0, 50).map((r) => (
                  <tr
                    key={r.rowNumber}
                    className={r.isValid ? 'hover:bg-slate-50/70' : 'bg-red-50/40'}
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-400">{r.rowNumber}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {formatDisplayDate(r.data.date || '')}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {r.data.customer || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                      {r.data.item || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{r.data.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatCurrency(r.data.rate)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#10243A]">
                      {formatCurrency(r.data.total)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {r.isValid ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 size={13} />
                          <span>Valid</span>
                          {r.rateTotalDiscrepancy && (
                            <span className="text-amber-600 text-[10px] ml-1">(Recalculated)</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-600 font-medium text-[11px]" title={r.errors.join('; ')}>
                          {r.errors[0]}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import Commit Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Only valid rows are imported into database records. Existing transactions will remain intact.
            </p>

            <button
              onClick={handleCommitImport}
              disabled={validRows.length === 0 || importing || !isAdmin}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>
                {importing ? 'Importing records…' : `Confirm Import of ${validRows.length} Valid Rows`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
