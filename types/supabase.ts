/**
 * TypeScript types for Supabase database tables
 * Generated for ExpiryScanner app
 */

export interface Database {
  public: {
    Tables: {
      inventory: {
        Row: InventoryRow;
        Insert: InventoryInsert;
        Update: InventoryUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

/**
 * Base inventory row type (what you get when selecting)
 */
export interface InventoryRow {
  id: string; // UUID
  user_id: string; // UUID
  barcode: string | null;
  product_name: string | null;
  category: string | null;
  expiry_date: string | null; // Date as ISO string
  ai_confidence: number | null; // Float
  created_at: string; // Timestamp as ISO string
}

/**
 * Inventory insert type (what you pass when creating)
 * Omit id, user_id, and created_at as they're auto-generated
 */
export interface InventoryInsert {
  id?: string; // Optional, defaults to gen_random_uuid()
  user_id?: string; // Optional, can be set or use auth.uid()
  barcode?: string | null;
  product_name?: string | null;
  category?: string | null;
  expiry_date?: string | null; // Date as ISO string or YYYY-MM-DD
  ai_confidence?: number | null;
  created_at?: string; // Optional, defaults to NOW()
}

/**
 * Inventory update type (what you pass when updating)
 * All fields optional, id and user_id typically shouldn't be updated
 */
export interface InventoryUpdate {
  barcode?: string | null;
  product_name?: string | null;
  category?: string | null;
  expiry_date?: string | null;
  ai_confidence?: number | null;
}
