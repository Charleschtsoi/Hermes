-- Create the inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barcode TEXT,
  product_name TEXT,
  category TEXT,
  expiry_date DATE,
  ai_confidence FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);

-- Create an index on barcode for faster lookups
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON inventory(barcode);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own inventory items
CREATE POLICY "Users can view their own inventory"
  ON inventory
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own inventory items
CREATE POLICY "Users can insert their own inventory"
  ON inventory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own inventory items
CREATE POLICY "Users can update their own inventory"
  ON inventory
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own inventory items
CREATE POLICY "Users can delete their own inventory"
  ON inventory
  FOR DELETE
  USING (auth.uid() = user_id);
