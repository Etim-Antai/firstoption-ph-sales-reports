import { describe, it, expect } from 'vitest';
import {
  normalizeHeader,
  generateTemplateCSV,
  generateRejectedCSV,
} from '../utils/importParser';
import { parseDateString, formatCurrency } from '../utils/formatters';

describe('Import & Validation Utilities', () => {
  it('normalizes common variations of table headers', () => {
    expect(normalizeHeader('Invoice_Number')).toBe('invoice_number');
    expect(normalizeHeader('Invoice Number')).toBe('invoice_number');
    expect(normalizeHeader('Staus(New or Returning)')).toBe('status');
    expect(normalizeHeader('sales order id (if applicable)')).toBe('sales_order_id');
    expect(normalizeHeader('Customer Category(Installers, end users, corporate, online )')).toBe('customer_category');
    expect(normalizeHeader('REMARK')).toBe('remark');
    expect(normalizeHeader('Part Number')).toBe('part_number');
  });

  it('correctly parses dates from multiple common formats', () => {
    expect(parseDateString('1/9/2026')).toBe('2026-01-09');
    expect(parseDateString('12/25/2026')).toBe('2026-12-25');
    expect(parseDateString('2026-03-15')).toBe('2026-03-15');
  });

  it('formats Nigerian Naira (₦) currency accurately', () => {
    expect(formatCurrency(54500)).toContain('54,500');
    expect(formatCurrency(57031710)).toContain('57,031,710');
    expect(formatCurrency(57031710, true)).toBe('₦57.0m');
  });

  it('generates downloadable template CSV with required columns', () => {
    const csv = generateTemplateCSV();
    expect(csv).toContain('Date,Customer,sales order id (if applicable)');
    expect(csv).toContain('Quantity,Rate');
    expect(csv).toContain('Invoice_Number');
  });

  it('generates downloadable rejected CSV with error annotations', () => {
    const rejected = [
      {
        rowNumber: 2,
        data: { customer: '', item: 'Solar fan', quantity: -1, rate: 50000 },
        errors: ['Customer name is required', 'Quantity must be a non-negative number'],
      },
    ];
    const csv = generateRejectedCSV(rejected);
    expect(csv).toContain('Row Number,Errors');
    expect(csv).toContain('Customer name is required');
  });
});
