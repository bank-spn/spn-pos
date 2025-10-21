# SPN POS - Point of Sale System

A modern, production-ready POS (Point of Sale) web application built with React, Vite, TypeScript, TailwindCSS, and Supabase.

## 🚀 Features

- **Modern UI**: Clean, minimal design optimized for iPad and desktop
- **Bilingual Support**: Thai and English language toggle
- **Dark Mode**: Full dark mode support
- **Real-time Updates**: Live inventory and order updates via Supabase Realtime
- **Product Management**: Grid/List view, category filtering, and search
- **Cart Management**: Quick edit, price override, and item notes
- **Multiple Payment Methods**: Cash, Card, and QR code payment simulation
- **Cashier Management**: Shift control and cash drawer tracking (coming soon)
- **Audit Log**: Complete transaction history (coming soon)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18.x or higher
- npm or pnpm
- A Supabase account and project
- Vercel account (for deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bank-spn/spn-pos.git
   cd spn-pos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_SUPABASE_URL="your-supabase-url"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   MASTER_PIN="your-master-pin"
   ```

4. **Apply database schema**
   
   **Important**: You must apply the database schema to your Supabase project before running the app.
   
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy the contents of `schema.sql`
   - Run the SQL script

   This will create:
   - All necessary tables (orders, products, payments, etc.)
   - Database functions (inventory deduction)
   - Row Level Security policies
   - Sample data (optional)

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 🏗️ Build

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🚢 Deployment to Vercel

### Option 1: Deploy via Vercel CLI

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
   vercel
   ```

4. **Set environment variables**
   
   After deployment, set the environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `MASTER_PIN`

5. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository (`bank-spn/spn-pos`)
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `MASTER_PIN`
6. Click "Deploy"

## 📁 Project Structure

```
spn-pos/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI workflow
├── functions/                  # Supabase Edge Functions
│   ├── pos_checkout/           # Server-side checkout handler
│   └── auth_pin_validate/      # PIN validation endpoint
├── src/
│   ├── components/
│   │   ├── layout/             # Layout components (Sidebar, Layout)
│   │   ├── pos/                # POS components (ProductCard, CategoryFilter)
│   │   ├── cart/               # Cart components (CartSidebar, CartItem)
│   │   ├── checkout/           # Checkout modal
│   │   ├── cashier/            # Cashier management (coming soon)
│   │   ├── common/             # Common components (PinModal, Toast)
│   │   └── audit/              # Audit log components (coming soon)
│   ├── hooks/
│   │   └── useRealtime.ts      # Realtime subscription hooks
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── store.ts            # Zustand state management
│   │   └── i18n.ts             # Internationalization
│   ├── pages/
│   │   ├── Welcome.tsx         # Landing page
│   │   ├── POS.tsx             # Main POS interface
│   │   ├── Dashboard.tsx       # Dashboard (coming soon)
│   │   ├── Cashier.tsx         # Cashier page (coming soon)
│   │   └── AuditLog.tsx        # Audit log (coming soon)
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── App.tsx                 # Main app component
├── schema.sql                  # Database schema (apply to Supabase)
├── vercel.json                 # Vercel configuration
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## 🔐 Authentication

The app uses a **frontend-only PIN authentication** system:
- Default Master PIN: `260539` (configurable via `MASTER_PIN` env variable)
- No user authentication flow (app runs anonymously)
- Suitable for single-location POS systems

## 🗄️ Database Schema

The database consists of two main schemas:

### POS Schema
- `pos.orders` - Order records
- `pos.order_items` - Line items per order
- `pos.payments` - Payment records
- `pos.categories` - Product categories
- `pos.shifts` - Cashier shifts
- `pos.cash_movements` - Cash drawer transactions

### ERP Schema
- `erp.inventory_items` - Product inventory

All tables have Row Level Security (RLS) enabled with anonymous access policies.

## 🔄 Real-time Features

The app subscribes to real-time updates for:
- New orders
- Inventory changes
- Stock updates

Toast notifications are shown when updates occur.

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.js` to customize the primary color:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom color palette
      },
    },
  },
},
```

### Adding Languages

Edit `src/lib/i18n.ts` to add more languages or modify translations.

## 🧪 Testing

The project includes a CI workflow (`.github/workflows/ci.yml`) that:
- Runs on push and pull requests
- Tests on Node.js 18.x and 20.x
- Lints the code (if lint script is available)
- Builds the project

## 📝 Notes

- **Schema Application**: The `schema.sql` file **must be applied once** to your Supabase database before the app can function properly.
- **Anonymous Access**: The app is configured for anonymous access. For production use with authentication, you'll need to update RLS policies.
- **Edge Functions**: The `functions/` directory contains optional Supabase Edge Functions for server-side operations. These are not required for basic functionality but can be deployed for enhanced security.
- **Service Role Key**: Do **NOT** include `SUPABASE_SERVICE_ROLE_KEY` in client-side code. Use Edge Functions for operations requiring elevated permissions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI powered by [TailwindCSS](https://tailwindcss.com/)
- Backend by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
- State management with [Zustand](https://github.com/pmndrs/zustand)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Vercel deployment guide](https://vercel.com/docs)

---

**Made with ❤️ for SPN**

