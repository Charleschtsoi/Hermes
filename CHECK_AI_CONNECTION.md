# Quick Checklist: Is AI Connected?

## Status Check

### ✅ What's Working:
- Frontend can call Supabase Edge Function (connection successful)
- Error handling is working (shows error messages)
- Manual entry fallback is working (modal opens when AI fails)

### ❌ What's NOT Working:
- Edge Function returns error (non-2xx status code)
- AI analysis fails

## Step-by-Step Debugging

### Step 1: Check if Edge Function is Deployed

**Option A: Using Supabase CLI**
```bash
# Check if you're logged in
supabase login

# Check if function exists
supabase functions list

# If not listed, deploy it:
supabase functions deploy analyze-product
```

**Option B: Using Supabase Dashboard**
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Edge Functions** in the left sidebar
4. Check if `analyze-product` is listed
5. If not, create it and paste the code from `supabase/functions/analyze-product/index.ts`

### Step 2: Check OpenAI API Key Configuration

The Edge Function needs the OpenAI API key to be set as a secret.

**Using Supabase CLI:**
```bash
# Set the OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key-here

# Verify it's set
supabase secrets list
```

**Using Supabase Dashboard:**
1. Go to **Edge Functions** → **analyze-product**
2. Click on **Settings** or **Environment Variables**
3. Add: `OPENAI_API_KEY` = `sk-your-openai-api-key-here`
4. Save

**Get your OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Step 3: Check Edge Function Logs

**Using Supabase CLI:**
```bash
# View real-time logs
supabase functions logs analyze-product --follow

# Or view recent logs
supabase functions logs analyze-product
```

**Using Supabase Dashboard:**
1. Go to **Edge Functions** → **analyze-product**
2. Click on **Logs** tab
3. Check for any error messages

### Step 4: Test Edge Function Directly

Test the Edge Function with a curl command:

```bash
# Replace with your actual values
curl -X POST https://YOUR-PROJECT-ID.supabase.co/functions/v1/analyze-product \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

**Expected successful response:**
```json
{
  "productName": "Product Name",
  "category": "Category",
  "expiryDate": "2024-01-17",
  "confidenceScore": 0.8
}
```

**If you get an error, check:**
- Is the Edge Function deployed? (Check Step 1)
- Is OPENAI_API_KEY set? (Check Step 2)
- What does the error message say? (Check logs in Step 3)

### Step 5: Check Frontend Configuration

Verify your `.env` file has the correct values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

After updating `.env`, **restart your Expo server**:
```bash
# Stop current server (Ctrl+C)
# Then restart:
npx expo start --clear
```

## Common Error Messages

### "Edge Function returned a non-2xx status code"
**Cause:** Edge Function exists but is returning an error (500, 400, etc.)
**Solution:** 
- Check Edge Function logs (Step 3)
- Verify OPENAI_API_KEY is set (Step 2)
- Check if Edge Function code has errors

### "Function not found" or 404
**Cause:** Edge Function is not deployed
**Solution:** Deploy the Edge Function (Step 1)

### "OpenAI API key is not configured"
**Cause:** OPENAI_API_KEY secret is not set in Supabase
**Solution:** Set the secret (Step 2)

### "No data returned from AI analysis"
**Cause:** Edge Function returns empty response
**Solution:** Check Edge Function logs for errors

## Quick Test

After configuring everything, try scanning a barcode. You should see:
1. ✅ "AI Agent analyzing..." message
2. ✅ Product details returned
3. ❌ OR manual entry modal opens (if AI can't identify)

If manual entry modal opens, check the console logs for the specific error message to debug further.
