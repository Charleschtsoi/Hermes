# Analyze Product Edge Function

This Supabase Edge Function analyzes product barcodes using OpenAI GPT-4o-mini to identify products and estimate shelf life.

## Setup

### 1. Deploy the Function

```bash
supabase functions deploy analyze-product
```

### 2. Environment Variables

Set the following environment variables in your Supabase project:

```bash
# Required: OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Optional: Supabase credentials (for database fallback)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Set Secrets (Using Supabase CLI)

```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Or set them in Supabase Dashboard:**
1. Go to **Edge Functions** → **analyze-product**
2. Click **Settings** or **Environment Variables**
3. Add the variables above

**Important:** Never hardcode API keys in source code. Always use environment variables or Supabase secrets.

## Usage

The function accepts a POST request with a JSON body:
```json
{
  "code": "123456789"
}
```

It returns:
```json
{
  "productName": "Organic Milk",
  "category": "Dairy",
  "expiryDate": "2024-12-31",
  "confidenceScore": 0.85
}
```

## How It Works

1. **Primary Attempt (AI Analysis)**: Calls OpenAI GPT-4o-mini with the barcode/code to estimate product details
2. **Validation**: Checks if AI confidence is >= 0.6 and product name is not "Unknown Product"
3. **Fallback (Database Lookup)**: If AI confidence is low, queries `product_master_list` table for exact matches
4. **Manual Entry**: If both AI and DB fail, returns `manualEntryRequired: true` flag

## Error Handling

- Returns 400 if `code` is missing or invalid
- Returns 500 if OpenAI API key is not configured
- Returns 500 if OpenAI API call fails
- Includes CORS headers for cross-origin requests

## Model Information

- **Model**: `gpt-4o-mini`
- **Temperature**: 0.7
- **Max Tokens**: 200
- **API Endpoint**: `https://api.openai.com/v1/chat/completions`

## Testing

Test the function locally:
```bash
supabase functions serve analyze-product
```

Then test with curl:
```bash
curl -X POST http://localhost:54321/functions/v1/analyze-product \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456789"}'
```
