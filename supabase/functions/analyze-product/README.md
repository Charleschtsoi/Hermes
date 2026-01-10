# Analyze Product Edge Function

This Supabase Edge Function analyzes product barcodes using OpenAI to estimate product details.

## Setup

1. **Deploy the function to Supabase:**
   ```bash
   supabase functions deploy analyze-product
   ```

2. **Set environment variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key (set in Supabase dashboard or via CLI)
   
   ```bash
   supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
   ```

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

## Error Handling

- Returns 400 if `code` is missing or invalid
- Returns 500 if OpenAI API key is not configured
- Returns 500 if OpenAI API call fails
- Includes CORS headers for cross-origin requests
