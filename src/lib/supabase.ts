import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SaleRecord } from '../types';
import { INITIAL_SALES_DATA } from '../data/initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_STORAGE_KEY = 'firstoption_solar_sales_v1';
const LOCAL_BATCHES_KEY = 'firstoption_solar_batches_v1';

// Local storage storage helper for offline/demo operation
export function getLocalSales(): SaleRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SALES_DATA));
      return INITIAL_SALES_DATA;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read local sales storage:', err);
    return INITIAL_SALES_DATA;
  }
}

export function saveLocalSales(records: SaleRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to persist local sales:', err);
  }
}

export function resetLocalSalesToDefault(): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SALES_DATA));
}

export function clearAllLocalSales(): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
}

// Unified Service layer
export async function getAllSales(): Promise<SaleRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sales_transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, falling back to local dataset:', error.message);
      return getLocalSales();
    }
    return (data as SaleRecord[]) || [];
  }

  return getLocalSales();
}

export async function addSale(record: Omit<SaleRecord, 'id'>): Promise<SaleRecord> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sales_transactions')
      .insert([record])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as SaleRecord;
  }

  const current = getLocalSales();
  const newId = current.length > 0 ? Math.max(...current.map((r) => Number(r.id) || 0)) + 1 : 1;
  const newRec: SaleRecord = {
    ...record,
    id: newId,
    created_at: new Date().toISOString(),
  };
  saveLocalSales([newRec, ...current]);
  return newRec;
}

export async function updateSale(id: string | number, updates: Partial<SaleRecord>): Promise<SaleRecord> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sales_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as SaleRecord;
  }

  const current = getLocalSales();
  const idx = current.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) throw new Error(`Sale with ID ${id} not found.`);

  const updatedRec = { ...current[idx], ...updates, updated_at: new Date().toISOString() };
  current[idx] = updatedRec;
  saveLocalSales(current);
  return updatedRec;
}

export async function deleteSale(id: string | number): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('sales_transactions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }

  const current = getLocalSales();
  const filtered = current.filter((r) => String(r.id) !== String(id));
  saveLocalSales(filtered);
}

export async function bulkInsertSales(
  records: Partial<SaleRecord>[],
  filename: string
): Promise<{ inserted: number }> {
  if (isSupabaseConfigured && supabase) {
    // 1. Create batch record
    const { data: batchData } = await supabase
      .from('import_batches')
      .insert([
        {
          filename,
          imported_count: records.length,
          total_rows: records.length,
        },
      ])
      .select()
      .single();

    const batchId = batchData?.id;

    // 2. Insert records with batch_id
    const payload = records.map((r) => ({
      ...r,
      batch_id: batchId,
    }));

    const { error } = await supabase.from('sales_transactions').insert(payload);
    if (error) throw new Error(error.message);

    return { inserted: records.length };
  }

  const current = getLocalSales();
  let nextId = current.length > 0 ? Math.max(...current.map((r) => Number(r.id) || 0)) + 1 : 1;

  const newRecords: SaleRecord[] = records.map((r) => ({
    id: nextId++,
    date: r.date || new Date().toISOString().split('T')[0],
    customer: r.customer || 'Unknown',
    sales_order_id: r.sales_order_id || '',
    contact: r.contact || '',
    status: r.status || 'Returning',
    customer_category: r.customer_category || 'End User',
    invoice_number: r.invoice_number || '',
    item: r.item || 'Item',
    part_number: r.part_number || '',
    quantity: Number(r.quantity) || 1,
    rate: Number(r.rate) || 0,
    remark: r.remark || '',
    total: Number(r.total) || (Number(r.quantity) || 1) * (Number(r.rate) || 0),
    created_at: new Date().toISOString(),
  }));

  saveLocalSales([...newRecords, ...current]);

  // Store batch metadata in local storage
  try {
    const existingBatches = JSON.parse(localStorage.getItem(LOCAL_BATCHES_KEY) || '[]');
    existingBatches.unshift({
      id: `local-batch-${Date.now()}`,
      filename,
      imported_count: newRecords.length,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_BATCHES_KEY, JSON.stringify(existingBatches));
  } catch (e) {
    console.error('Failed to save batch log:', e);
  }

  return { inserted: newRecords.length };
}
