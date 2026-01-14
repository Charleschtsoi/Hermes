import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { InventoryRow, InventoryInsert, InventoryUpdate } from '../types/supabase';

/**
 * Get all inventory items for the current user
 */
export async function getInventoryItems(): Promise<InventoryRow[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch inventory: ${error.message}`);
  }

  return data || [];
}

/**
 * Add a new item to inventory
 */
export async function addInventoryItem(item: InventoryInsert): Promise<InventoryRow> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('inventory')
    .insert(item)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add inventory item: ${error.message}`);
  }

  return data;
}

/**
 * Update an inventory item
 */
export async function updateInventoryItem(
  id: string,
  updates: InventoryUpdate
): Promise<InventoryRow> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update inventory item: ${error.message}`);
  }

  return data;
}

/**
 * Delete an inventory item
 */
export async function deleteInventoryItem(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete inventory item: ${error.message}`);
  }
}

/**
 * Search inventory items by product name or barcode
 */
export async function searchInventoryItems(query: string): Promise<InventoryRow[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .or(`product_name.ilike.%${query}%,barcode.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to search inventory: ${error.message}`);
  }

  return data || [];
}

/**
 * Filter inventory items by category
 */
export async function filterInventoryByCategory(category: string): Promise<InventoryRow[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to filter inventory: ${error.message}`);
  }

  return data || [];
}
