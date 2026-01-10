-- Create the product_master_list table
CREATE TABLE IF NOT EXISTS product_master_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  shelf_life_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_master_list_code ON product_master_list(code);

-- Enable Row Level Security (RLS)
ALTER TABLE product_master_list ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read (SELECT) from product_master_list
CREATE POLICY "Authenticated users can view product master list"
  ON product_master_list
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert dummy test data for immediate testing
INSERT INTO product_master_list (code, name, category, shelf_life_days) VALUES
  ('BATCH-001', 'Frozen Chicken', 'Meat', 365),
  ('123456', 'Organic Milk', 'Dairy', 7),
  ('654321', 'Greek Yogurt', 'Dairy', 14)
ON CONFLICT (code) DO NOTHING;
