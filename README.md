# Alankar Fashions — Premium Artificial Jewellery E-Commerce

A production-ready, full-stack e-commerce platform for **Alankar Fashions**, an artificial jewellery brand from Kolhapur, Maharashtra. Built to feel authentically Indian, look premium, and rank well on search and AI answer engines.

**स्त्रीचे सौंदर्य खुलवणारे — Considered jewellery from Kolhapur since 1998**

## Tech Stack

- **Frontend:** Next.js 15 (App Router, JavaScript), Tailwind CSS, shadcn/ui
- **Fonts:** Cormorant Garamond (headings), Inter (body), Noto Serif Devanagari (Marathi/Hindi)
- **Backend:** Next.js API routes (Node.js) — deployable to any Node host
- **DB + Auth:** Supabase (Postgres + Auth + Storage) with full Row Level Security
- **Payments:** Razorpay (UPI, cards, netbanking, wallets) with webhook verification
- **Email:** Resend with 6 branded templates (order confirmation, status updates, abandoned cart, welcome, low-stock)
- **Analytics:** Meta Pixel + Google Analytics 4 (auto-injected via admin settings)

## First-Time Setup (2 minutes)

1. Open `/setup` in the app.
2. Follow steps 1 and 2 — paste each SQL block into Supabase SQL Editor and Run.
3. Log in at `/admin/login` with the pre-provisioned admin (below).

## Admin Access

- URL: `/admin/login`
- Email: `admin@aurelia.local`
- Password: `AureliaAdmin!2026`

**Change the password on first login.** To create a real branded admin (`admin@alankarfashions.com`), sign up normally, then update `profiles.role` to `admin` in Supabase.

## Feature Highlights

### Storefront (customer)
- Homepage — fully admin-editable (hero slides, category grid, product strips, editorial, promo bar) with **no code changes**
- Product listing with filters (category, price, size, color) and sort
- Product detail with image gallery, size/color, variants, related products, JSON-LD Product schema, FAQ per product
- Cart, checkout (guest + logged-in), Razorpay hosted checkout, order confirmation, order tracking
- Login, signup with welcome email, account, wishlist, addresses
- Global search with live suggestions
- **Floating WhatsApp button** for instant contact
- Fully responsive, boutique jewellery aesthetic (cream + maroon + antique gold)

### Admin panel (`/admin`)
- Dashboard: revenue, orders, low stock, 14-day chart
- **Products:** CRUD + variants + featured/new/trending flags + image upload to Supabase Storage
- **Categories:** parent/child nesting (Pearls > Chinchpeti, etc.)
- **Orders:** status timeline + status updates + invoice PDF + WhatsApp customer link
- **Homepage CMS:** edit hero slides, category grid, product sections, editorial, announcement bar
- **Settings:**
  - Brand identity (logo upload, favicon, contact, address, socials, GSTIN, WhatsApp prefilled message)
  - Payment (Razorpay keys, live-mode toggle)
  - **Analytics** (Meta Pixel ID, GA4 Measurement ID)
  - **SEO** (default meta description, Google Search Console verification)
  - **Test email** delivery button
- Customers list, Coupons
- Full admin audit log

### SEO & AEO
- Semantic HTML with correct heading hierarchy
- Dynamic **sitemap.xml** (`/sitemap.xml`) covering all products, categories, static pages
- Dynamic **robots.txt** (`/robots.txt`)
- **JSON-LD** on every relevant page: `LocalBusiness` (contact/home), `Product` (PDPs), `FAQPage`, `BreadcrumbList`
- Open Graph + Twitter Card meta on every page
- Alt text on product images from product name (keyword-relevant)
- Product FAQ section (AEO-friendly Q&A)
- Server-rendered metadata (via `generateMetadata`)

### Emails (Resend)
All templates use the brand palette (maroon + gold), include the logo, and render cleanly on desktop and mobile:
1. **Order confirmation** — triggered on successful payment
2. **Order status updates** — processing/shipped/out for delivery/delivered/cancelled/refunded
3. **Welcome email** — on signup, with `ALANKAR10` coupon
4. **Abandoned cart / abandoned checkout** — via `/api/cron/abandoned-cart` (call from cron-job.org)
5. **Low-stock admin alert** — when a paid order drops stock ≤ 5
6. **Test email** — from Admin > Settings

## ⚠️ Email Deliverability — One Manual Step Required

By default we send from `onboarding@resend.dev` (Resend's testing domain), which works but may land in spam. **Before going live, verify `alankarfashions.com` in Resend:**

1. Go to https://resend.com/domains → **Add Domain** → `alankarfashions.com`
2. Resend will show you these DNS records to add. Add them at your DNS host (Hostinger → hPanel → Domains → Manage → DNS Zone):
   - **SPF (TXT)** on `send.alankarfashions.com` (or root, per Resend's UI): `v=spf1 include:amazonses.com ~all`
   - **DKIM (TXT / CNAME)** — Resend gives you 1–3 specific CNAMEs like `resend._domainkey.alankarfashions.com → <resend-provided>.dkim.amazonses.com`
   - **DMARC (TXT)** on `_dmarc.alankarfashions.com`: `v=DMARC1; p=none; rua=mailto:hello@alankarfashions.com`
   - **MX (optional, only if you want to receive)** on `send.alankarfashions.com`
3. Wait 5–30 minutes, click **Verify** in Resend.
4. In your app `.env`, set `RESEND_FROM_EMAIL=orders@alankarfashions.com`.

Until verification is done, emails work but will send from `onboarding@resend.dev`.

## Hostinger Deployment (Node.js Business hosting)

### 1. In Hostinger hPanel
1. **Domains** → point `alankarfashions.com` to Hostinger's hosting.
2. **hPanel** → **Advanced** → **Node.js**:
   - **Node version:** `20 LTS` (or 22)
   - **Application root:** the folder where you upload the repo (e.g., `public_html/app`)
   - **Application URL:** `https://alankarfashions.com`
   - **Application startup file:** leave blank (we override with a custom start command)

### 2. Upload code
Either:
- **Git deploy:** Enable Git in Hostinger, paste the GitHub repo URL, deploy the `main` branch, OR
- **SFTP:** upload the whole project (excluding `node_modules`, `.env`, `.next`).

### 3. Set environment variables
In Hostinger → Node.js → **Environment variables**, add every variable from `.env.example` with real values.

### 4. Build and start
In the Hostinger Node.js panel terminal (or SSH):
```bash
yarn install --frozen-lockfile
yarn build
yarn start   # equivalent to: next start -p $PORT
```
Set **Startup command** in Hostinger to: `yarn start`

### 5. Configure Razorpay webhook
- In Razorpay Dashboard → **Settings** → **Webhooks** → **Create Webhook**
- URL: `https://alankarfashions.com/api/webhooks/razorpay`
- Events: `payment.captured`
- Copy the Webhook Secret → paste in **Admin → Settings → Payment**.

### 6. Set up the abandoned-cart cron
Go to https://cron-job.org, create a cron:
- URL: `https://alankarfashions.com/api/cron/abandoned-cart`
- Method: `POST`
- Header: `x-cron-token: <your CRON_SECRET value>`
- Schedule: every hour

### 7. Going live
- Switch Razorpay to live keys in **Admin → Settings → Payment** and tick **Live mode**.
- Verify Resend domain (see above).
- Add Meta Pixel and GA4 IDs in **Admin → Settings → Analytics**.
- Add Google Search Console verification in **Admin → Settings → SEO**.
- Submit your sitemap to Google Search Console: `https://alankarfashions.com/sitemap.xml`

## Security Checklist (implemented)
See `SECURITY.md` for the full list. Key items:
- Row Level Security on every Postgres table
- Server-side admin role checks on every `/api/admin/*` route
- Zod input validation on all writes
- Razorpay HMAC signature verification on both callback and webhook
- Rate limits on login, signup, checkout, search
- Secure security headers (X-Frame-Options, HSTS, etc.) via middleware
- Service role key server-only; never in client bundle
- File upload MIME + size validation

## Repository

To push to your GitHub repo:

```bash
cd /app
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If your repo already exists, replace the URL. If you use a Personal Access Token (PAT), git will prompt for username + PAT as password.
