import * as XLSX from 'xlsx';
import { ImportValidationResult, SaleRecord } from '../types';
import { parseDateString } from './formatters';

export function normalizeHeader(h: string): string {
  const clean = h.trim().toLowerCase().replace(/[\(\)\[\]_]/g, ' ').replace(/\s+/g, ' ');
  if (clean.includes('date')) return 'date';
  if (clean.includes('customer category') || clean.includes('category')) return 'customer_category';
  if (clean.includes('customer')) return 'customer';
  if (clean.includes('sales order') || clean.includes('order id')) return 'sales_order_id';
  if (clean.includes('contact') || clean.includes('phone') || clean.includes('mobile')) return 'contact';
  if (clean.includes('staus') || clean.includes('status')) return 'status';
  if (clean.includes('invoice')) return 'invoice_number';
  if (clean.includes('item') || clean.includes('product') || clean.includes('description')) return 'item';
  if (clean.includes('part number') || clean.includes('part no') || clean.includes('sku')) return 'part_number';
  if (clean.includes('quantity') || clean.includes('qty')) return 'quantity';
  if (clean.includes('rate') || clean.includes('unit price') || clean.includes('price')) return 'rate';
  if (clean.includes('remark') || clean.includes('note') || clean.includes('comment')) return 'remark';
  if (clean.includes('total') || clean.includes('amount')) return 'total';
  return clean;
}

export async function parseFileForImport(
  file: File,
  existingRecords: SaleRecord[] = []
): Promise<{
  results: ImportValidationResult[];
  validCount: number;
  rejectedCount: number;
  totalRows: number;
  duplicateCount: number;
  discrepancyCount: number;
  validRows: Partial<SaleRecord>[];
  rejectedRows: { rowNumber: number; data: any; errors: string[] }[];
}> {
  const buffer = await file.arrayBuffer();
  // Read using sheetjs with raw=false and cellDates=true to preserve string representations
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, raw: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('The uploaded spreadsheet contains no sheets.');
  }

  const worksheet = workbook.Sheets[sheetName];
  // Convert sheet to json array of objects
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    throw new Error('The uploaded file does not contain a header and data rows.');
  }

  const rawHeaders: string[] = rawRows[0].map((c: any) => String(c || '').trim());
  const headerMap: Record<number, string> = {};

  rawHeaders.forEach((h, idx) => {
    headerMap[idx] = normalizeHeader(h);
  });

  const results: ImportValidationResult[] = [];
  const validRows: Partial<SaleRecord>[] = [];
  const rejectedRows: { rowNumber: number; data: any; errors: string[] }[] = [];

  let duplicateCount = 0;
  let discrepancyCount = 0;

  // Build a lookup signature of existing records for deduplication
  const existingSet = new Set(
    existingRecords.map(
      (r) =>
        `${r.date}|${r.customer?.toLowerCase()}|${r.invoice_number?.toLowerCase()}|${r.item?.toLowerCase()}|${r.quantity}|${r.rate}`
    )
  );

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    // Skip empty lines
    if (!row || row.every((c: any) => c === '' || c === null || c === undefined)) {
      continue;
    }

    const rowObj: any = {};
    row.forEach((val: any, colIdx: number) => {
      const key = headerMap[colIdx];
      if (key) {
        rowObj[key] = val !== undefined && val !== null ? String(val).trim() : '';
      }
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse & Validate Date
    const parsedDate = parseDateString(rowObj.date);
    if (!parsedDate || !/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
      errors.push(`Invalid or missing date: "${rowObj.date || ''}"`);
    }

    // Customer
    const customer = String(rowObj.customer || '').trim();
    if (!customer) {
      errors.push('Customer name is required');
    }

    // Item
    const item = String(rowObj.item || '').trim();
    if (!item) {
      errors.push('Product / Item description is required');
    }

    // Quantity
    const qtyRaw = String(rowObj.quantity || '0').replace(/,/g, '');
    const quantity = parseFloat(qtyRaw);
    if (isNaN(quantity) || quantity < 0) {
      errors.push(`Quantity must be a non-negative number (got "${rowObj.quantity}")`);
    }

    // Rate
    const rateRaw = String(rowObj.rate || '0').replace(/[,₦]/g, '');
    const rate = parseFloat(rateRaw);
    if (isNaN(rate) || rate < 0) {
      errors.push(`Rate must be a non-negative number (got "${rowObj.rate}")`);
    }

    // Total check & discrepancy detection
    const totalRaw = String(rowObj.total || '').replace(/[,₦]/g, '');
    let total = parseFloat(totalRaw);
    const calculatedTotal = (isNaN(quantity) ? 0 : quantity) * (isNaN(rate) ? 0 : rate);
    let rateTotalDiscrepancy = false;

    if (isNaN(total)) {
      total = calculatedTotal;
    } else if (Math.abs(calculatedTotal - total) > 0.05) {
      rateTotalDiscrepancy = true;
      discrepancyCount++;
      warnings.push(`Calculated total (₦${calculatedTotal.toLocaleString()}) differs from file total (₦${total.toLocaleString()}). Will use calculated value.`);
      total = calculatedTotal;
    }

    // Customer Category normalisation
    let category = String(rowObj.customer_category || '').trim();
    if (!category) category = 'End User';

    // Status normalisation
    let status = String(rowObj.status || '').trim();
    if (!status) status = 'Returning';
    if (status.toUpperCase() === 'NEW') status = 'New';
    else if (status.toUpperCase() === 'EXISTING' || status.toUpperCase() === 'RETURNING') status = 'Returning';

    // Deduplication check
    const sig = `${parsedDate}|${customer.toLowerCase()}|${String(rowObj.invoice_number || '').toLowerCase()}|${item.toLowerCase()}|${quantity}|${rate}`;
    const isDuplicate = existingSet.has(sig);
    if (isDuplicate) {
      duplicateCount++;
      warnings.push('Matches an existing transaction in database (potential duplicate)');
    }

    const saleData: Partial<SaleRecord> = {
      date: parsedDate,
      customer,
      sales_order_id: String(rowObj.sales_order_id || '').trim(),
      contact: String(rowObj.contact || '').trim(),
      status,
      customer_category: category,
      invoice_number: String(rowObj.invoice_number || '').trim(),
      item,
      part_number: String(rowObj.part_number || '').trim(),
      quantity,
      rate,
      remark: String(rowObj.remark || '').trim(),
      total,
    };

    const isValid = errors.length === 0;

    results.push({
      rowNumber: i + 1,
      data: saleData,
      errors,
      warnings,
      isValid,
      isDuplicate,
      rateTotalDiscrepancy,
    });

    if (isValid) {
      validRows.push(saleData);
    } else {
      rejectedRows.push({
        rowNumber: i + 1,
        data: rowObj,
        errors,
      });
    }
  }

  return {
    results,
    validCount: validRows.length,
    rejectedCount: rejectedRows.length,
    totalRows: results.length,
    duplicateCount,
    discrepancyCount,
    validRows,
    rejectedRows,
  };
}

export function generateRejectedCSV(rejectedRows: { rowNumber: number; data: any; errors: string[] }[]): string {
  const headers = ['Row Number', 'Errors', 'Date', 'Customer', 'Invoice Number', 'Item', 'Quantity', 'Rate', 'Total', 'Category', 'Status', 'Contact', 'Remark'];
  const rows = rejectedRows.map((r) => [
    r.rowNumber,
    `"${r.errors.join('; ').replace(/"/g, '""')}"`,
    `"${r.data.date || ''}"`,
    `"${(r.data.customer || '').replace(/"/g, '""')}"`,
    `"${r.data.invoice_number || ''}"`,
    `"${(r.data.item || '').replace(/"/g, '""')}"`,
    r.data.quantity || '',
    r.data.rate || '',
    r.data.total || '',
    `"${r.data.customer_category || ''}"`,
    `"${r.data.status || ''}"`,
    `"${r.data.contact || ''}"`,
    `"${(r.data.remark || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export function generateTemplateCSV(): string {
  const headers = [
    'Date',
    'Customer',
    'sales order id (if applicable)',
    'Contact',
    'Staus(New or Returning)',
    'Customer Category(Installers, end users, corporate, online )',
    'Invoice_Number',
    'Item',
    'Part Number',
    'Quantity',
    'Rate',
    'REMARK',
    'Total',
  ];

  const sampleRows = [
    '2026-01-15,Ikechukwu Opara,,8037026047,EXISTING,End User,11704,itel 6kw/48v hybride inverter,,1,710000,,710000',
    '2026-01-15,Ikechukwu Opara,,8037026047,EXISTING,End User,11704,jinko 610w solar panel,,8,135000,,1080000',
    '2026-01-16,Ogochukwu,,,EXISTING,Installer,11705,tbb 1kva /12v inverter,,1,140000,,140000',
    '2026-01-24,Miss Nkiru,,,NEW,End User,11709,solar standing fan,,1,55000,,55000',
  ];

  return [headers.join(','), ...sampleRows].join('\r\n');
}

export function exportRecordsToCSV(records: SaleRecord[]): string {
  const headers = [
    'Date',
    'Customer',
    'Sales Order ID',
    'Contact',
    'Status',
    'Customer Category',
    'Invoice Number',
    'Item',
    'Part Number',
    'Quantity',
    'Rate (NGN)',
    'Remark',
    'Total (NGN)',
  ];

  const rows = records.map((r) => [
    r.date,
    `"${(r.customer || '').replace(/"/g, '""')}"`,
    `"${r.sales_order_id || ''}"`,
    `"${r.contact || ''}"`,
    `"${r.status || ''}"`,
    `"${r.customer_category || ''}"`,
    `"${r.invoice_number || ''}"`,
    `"${(r.item || '').replace(/"/g, '""')}"`,
    `"${r.part_number || ''}"`,
    r.quantity,
    r.rate,
    `"${(r.remark || '').replace(/"/g, '""')}"`,
    r.total,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
