/**
 * Currency & Number Formatting Utilities for Nigerian Naira (₦)
 */

export function formatCurrency(amount: number | null | undefined, compact = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₦0';
  }

  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `₦${(amount / 1_000_000).toFixed(1)}m`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `₦${(amount / 1_000).toFixed(0)}k`;
    }
    return `₦${Math.round(amount).toLocaleString('en-NG')}`;
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('NGN', '₦').trim();
}

export function formatNumber(val: number | null | undefined, decimals = 0): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function parseDateString(raw: string | number | Date | null | undefined): string {
  if (!raw) return '';
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return raw.toISOString().split('T')[0];
  }
  const str = String(raw).trim();
  if (!str) return '';

  // Handle ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
    const parts = str.split('T')[0].split('-');
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Handle M/D/YYYY or MM/DD/YYYY format from CSV
  const mdyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mdyMatch) {
    const m = mdyMatch[1].padStart(2, '0');
    const d = mmdMatchLeading(mdyMatch[2]);
    const y = mdyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Handle D-M-YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dmyMatch) {
    const d = mmdMatchLeading(dmyMatch[1]);
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Try standard Date parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return str;
}

function mmdMatchLeading(v: string): string {
  return v.padStart(2, '0');
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month]} ${day}, ${year}`;
  }
  return isoDate;
}

export function cleanText(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}
