# Setup Guide for AI Agent Integration

This guide will help you set up the AI Agent Integration feature for ExpiryScanner.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. An OpenAI API key (get one at https://platform.openai.com/api-keys)
3. Environment variables configured

## Step 1: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project dashboard under Settings > API.

## Step 2: Deploy the Database Schema

Run the migration to create the inventory table:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase SQL Editor:
# File: supabase/migrations/001_create_inventory_table.sql
```

## Step 3: Deploy the Edge Function

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Set the OpenAI API key as a secret:**
   ```bash
   supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
   ```

5. **Deploy the Edge Function:**
   ```bash
   supabase functions deploy analyze-product
   ```

## Step 4: Test the Integration

1. Start your Expo app:
   ```bash
   npm start
   ```

2. Scan a barcode or manually enter a code
3. The app will show a loading spinner while the AI analyzes the product
4. Once complete, a "Product Found" card will display with:
   - Product Name
   - Category
   - Estimated Expiry Date
   - AI Confidence Score

5. Click "Save to Inventory" to save the product to your Supabase database

## Troubleshooting

### Edge Function Not Found
- Ensure you've deployed the function: `supabase functions deploy analyze-product`
- Check that your Supabase project URL is correct in `.env`

### OpenAI API Key Error
- Verify the secret is set: `supabase secrets list`
- Ensure your OpenAI API key is valid and has credits

### Authentication Error
- Make sure you're logged in to Supabase in your app
- Check RLS policies are properly configured on the inventory table

### Environment Variables Not Loading
- For Expo, use `EXPO_PUBLIC_` prefix for client-side variables
- Restart your Expo development server after changing `.env` files
- For production builds, configure environment variables in your build platform (EAS, etc.)
