# Aurelia — Premium Fashion E-Commerce

A production-ready, full-stack fashion e-commerce platform built with Next.js (App Router), Supabase (Postgres + Auth + Storage), Razorpay (payments), and Resend (email).

## Tech Stack

- **Frontend:** Next.js 15 (App Router, JavaScript), Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js API routes (Node.js, deployable to any Node host)
- **Database + Auth:** Supabase (Postgres + Supabase Auth + Row Level Security)
- **Payments:** Razorpay (UPI, cards, netbanking, wallets) with server-side webhook verification
- **Emails:** Resend (order confirmation, status updates, low-stock alerts)
- **Storage:** Supabase Storage (product images)
- **Charts:** Recharts for admin dashboard

## First-Time Setup (2 minutes)

1. **Open the app in a browser** and go to `/setup`.
2. Click **Copy SQL**, then **Open Supabase SQL Editor** (opens Supabase in a new tab).
3. Paste and **Run**. This creates all tables, RLS policies, seed data (12 products, 4 categories, homepage sections, coupons) and the `product-images` storage bucket.
4. Come back to `/setup` and click **Verify Installation**.
5. Log in at `/admin/login` with:
   - **Email:** `admin@aurelia.local`
   - **Password:** `AureliaAdmin!2026`

## Environment Variables

See `.env.example` for the full list. All required keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never expose
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RAZORPAY_KEY_ID=                 # can also be set from Admin → Settings
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
BRAND_NAME=Aurelia
ADMIN_LOW_STOCK_EMAIL=admin@yourbrand.com
```

## Feature Matrix

### Storefront
- Home with CMS-driven hero (multi-slide, auto-rotate), category grid, featured/new/trending strips, editorial banner, benefits bar, announcement bar
- Product listing with filters (category, price, size, color) and sort (newest, popular, price)
- Product detail with image gallery, size/color pickers, variants, related products, reviews, add-to-bag & Buy Now
- Cart (persistent via localStorage), coupon application, order summary
- Checkout: guest + logged-in, address form, Razorpay hosted checkout, server-side verification
- Order confirmation, tracking (5-step status), order history, wishlist, account page
- Search with live suggestions, mobile-first responsive UI, skeleton loaders, empty states

### Admin Panel (`/admin`)
- Secure admin login with server-side role check on every request
- Dashboard: revenue, order count, low-stock, 14-day sales chart, recent orders
- Products: full CRUD, variants (sizes, colors), image URL & file upload, featured/new/trending flags, stock, status
- Categories, Coupons, Customers, Orders (status timeline + status updates)
- **Homepage CMS**: edit hero slides, category grid, featured/new/trending sections, editorial banner, announcement bar
- Settings: Razorpay keys, webhook secret, brand info
- Admin audit log recorded on every write

### Automation
- Order confirmation email on successful payment (Resend)
- Status update emails (processing/shipped/delivered/cancelled)
- Low-stock alert to admin email
- Razorpay webhook is the source of truth for payment capture

## Hostinger (Node.js) Deployment Checklist

1. Push the repo to GitHub/GitLab.
2. In Hostinger hPanel → Advanced → Node.js:
   - Node version: **20 LTS or newer**
   - Application root: your project folder
   - Startup file: leave blank; use custom start
   - Environment variables: paste all from `.env.example` with real values
3. Build & start commands (in Hostinger terminal):
   ```bash
   yarn install --frozen-lockfile
   yarn build
   yarn start   # equivalent to: next start -p $PORT
   ```
4. Point your domain to the Hostinger app (in hPanel → Domains).
5. Configure Razorpay webhook to: `https://yourdomain.com/api/webhooks/razorpay` with the events `payment.captured`. Copy the webhook secret into **Admin → Settings → Payment**.
6. Switch Razorpay from test to live keys once you’ve completed end-to-end testing.

## Switching Razorpay from Test to Live

1. Complete at least 3 test orders successfully.
2. In Razorpay Dashboard → Settings → API Keys, generate **live** keys.
3. Open `/admin/settings`, paste the live `key_id`, `key_secret`, and `webhook_secret`, check **Live mode**, and Save.
4. Update the webhook URL to your live domain.
5. Place one small live test order (₹1) to confirm end-to-end.
