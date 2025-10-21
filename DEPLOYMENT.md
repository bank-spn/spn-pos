# SPN POS - Deployment Guide

This guide provides step-by-step instructions for deploying the SPN POS application to Vercel.

## 📋 Prerequisites

1. **Supabase Project**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Apply the database schema from `schema.sql`
   - Note your project URL and anon key

2. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub account

3. **GitHub Repository**
   - Repository: `https://github.com/bank-spn/spn-pos`
   - Ensure you have access to the repository

## 🗄️ Step 1: Setup Supabase Database

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Apply Database Schema**
   - Copy the entire contents of `schema.sql` from the repository
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Go to Table Editor
   - You should see tables in `pos` and `erp` schemas:
     - `pos.categories`
     - `pos.orders`
     - `pos.order_items`
     - `pos.payments`
     - `pos.shifts`
     - `pos.cash_movements`
     - `erp.inventory_items`

4. **Get Supabase Credentials**
   - Go to Project Settings > API
   - Copy:
     - Project URL (e.g., `https://xxxxx.supabase.co`)
     - Anon/Public Key (starts with `eyJ...`)

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select `bank-spn/spn-pos` from your GitHub repositories
   - Click "Import"

2. **Configure Project**
   - **Project Name**: `spn-pos` (or your preferred name)
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

3. **Add Environment Variables**
   
   Click "Environment Variables" and add the following:

   | Name | Value | Description |
   |------|-------|-------------|
   | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Your Supabase anon key |
   | `MASTER_PIN` | `260539` | Master PIN for app access (change this!) |

   **Important**: Make sure to add these variables for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be live at `https://spn-pos.vercel.app` (or your custom domain)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd spn-pos
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   # Enter your Supabase URL when prompted
   
   vercel env add VITE_SUPABASE_ANON_KEY
   # Enter your Supabase anon key when prompted
   
   vercel env add MASTER_PIN
   # Enter your master PIN when prompted
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## ✅ Step 3: Verify Deployment

1. **Open the Deployed App**
   - Visit your Vercel deployment URL
   - You should see the PIN entry screen

2. **Test PIN Authentication**
   - Enter the Master PIN (default: `260539`)
   - You should be redirected to the Welcome page

3. **Test POS Functionality**
   - Click "Point of Sale" on the Welcome page
   - Verify that products load from Supabase
   - Try adding items to cart
   - Test checkout flow

## 🔧 Troubleshooting

### Build Fails

**Error**: `Cannot find module '@supabase/supabase-js'`
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally and commit `package-lock.json`

**Error**: `TypeScript errors during build`
- **Solution**: Check that all type imports use `import type { ... }`
- Run `npm run build` locally to catch errors before deployment

### App Loads but Shows Errors

**Error**: `Missing Supabase environment variables`
- **Solution**: Verify environment variables are set in Vercel dashboard
- Go to Project Settings > Environment Variables
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

**Error**: `Failed to load products` or `Database error`
- **Solution**: Verify database schema is applied
- Check Supabase logs for errors
- Ensure RLS policies allow anonymous access

### Products Don't Load

1. **Check Supabase Connection**
   - Open browser console (F12)
   - Look for network errors
   - Verify Supabase URL is correct

2. **Check Database**
   - Go to Supabase Table Editor
   - Verify `erp.inventory_items` table exists
   - Add sample products if table is empty

3. **Check RLS Policies**
   - Go to Supabase Authentication > Policies
   - Verify policies allow anonymous read access

## 🔐 Security Recommendations

1. **Change Master PIN**
   - Update `MASTER_PIN` environment variable in Vercel
   - Use a secure 6-digit PIN
   - Redeploy after changing

2. **Enable Row Level Security**
   - The schema already enables RLS
   - For production, consider adding user authentication
   - Update RLS policies to restrict access

3. **Monitor Usage**
   - Check Supabase dashboard for usage metrics
   - Set up alerts for unusual activity
   - Review logs regularly

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Make Changes Locally**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin master
   ```

2. **Automatic Deployment**
   - Vercel detects the push
   - Builds and deploys automatically
   - Check deployment status in Vercel dashboard

## 🌐 Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to Project Settings > Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `pos.yourcompany.com`)

2. **Configure DNS**
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation (can take up to 48 hours)

3. **Enable HTTPS**
   - Vercel automatically provisions SSL certificate
   - Your app will be available at `https://pos.yourcompany.com`

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console for errors
4. Open an issue on GitHub

## 📝 Checklist

Before going live, ensure:

- [ ] Database schema applied successfully
- [ ] Sample data added (optional)
- [ ] Environment variables set in Vercel
- [ ] Master PIN changed from default
- [ ] App loads without errors
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Checkout completes successfully
- [ ] Inventory updates after checkout
- [ ] Custom domain configured (optional)

---

**Deployment completed!** Your POS system is now live and ready to use. 🎉

