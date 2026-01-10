-- Query to find items expiring in 3 days from now
-- This can be run in Supabase SQL Editor or used with pg_cron for daily execution
-- 
-- Note: In production, you would use pg_cron to run this daily:
-- SELECT cron.schedule('daily-expiry-check', '0 9 * * *', $$...$$);

-- Find all inventory items where expiry_date is 3 days from today
SELECT 
  id,
  user_id,
  barcode,
  product_name,
  category,
  expiry_date,
  ai_confidence,
  created_at,
  -- Calculate days until expiry for reference
  (expiry_date::date - CURRENT_DATE) as days_until_expiry
FROM inventory
WHERE 
  expiry_date IS NOT NULL
  AND expiry_date::date = CURRENT_DATE + INTERVAL '3 days'
ORDER BY expiry_date ASC, product_name ASC;

-- Alternative query: Find items expiring within 3 days (today, tomorrow, and 3 days from now)
-- Uncomment to use this instead:
/*
SELECT 
  id,
  user_id,
  barcode,
  product_name,
  category,
  expiry_date,
  ai_confidence,
  created_at,
  (expiry_date::date - CURRENT_DATE) as days_until_expiry
FROM inventory
WHERE 
  expiry_date IS NOT NULL
  AND expiry_date::date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '3 days')
ORDER BY expiry_date ASC, product_name ASC;
*/
