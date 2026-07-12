# Alankar Fashions — PRD & Work Log

## Live Site
- Production URL: https://alankarfashions.com (Hostinger, Node.js hosting)
- GitHub: https://github.com/samfonde/alankar-fashions
- Stack: Next.js 15 App Router · Supabase (Postgres+Auth+Storage) · Razorpay · Resend

## Session (Jan 2026) — Changes shipped

### 1. CRITICAL — Fresh-load crash fix (`app/layout.js` + `lib/supabase/admin.js`)
- Symptom: `Application error: a client-side exception has occurred` only on fresh loads (typing URL, hard refresh), internal nav worked fine.
- Root cause: `getBrand()` in `app/layout.js` runs during SSR of every fresh page load (both `generateMetadata` and `RootLayout` invoke it). If `settings.value` jsonb rows were null / arrays / strings (or missing entirely), destructured props flowed into the `<Analytics/>` client component's `<Script>` render — causing a hydration-time exception. `getSupabaseAdmin()` also threw synchronously when env vars were empty at build time (Hostinger sometimes bakes empty `NEXT_PUBLIC_*` at build if env vars aren't set for the build step).
- Fix: `getSupabaseAdmin()` returns `null` gracefully instead of throwing; `getBrand()` coerces every jsonb value to a plain object; `generateMetadata()` wrapped in try/catch with fallback; `RootLayout` guards `analytics` before spreading.

### 2. Public storefront — Admin button removed (`components/site-header.js`)
- Removed Admin link from desktop nav and mobile drawer. Admins reach panel via `/admin` URL directly.

### 3. Cash on Delivery (COD) — end-to-end
- Checkout: payment selector (Online / COD), eligibility rules, handling fee display.
- API: skips Razorpay when `payment_method=cod`; creates order with `status=processing`, `payment_status=cod_pending`.
- Email: dedicated `sendCODOrderConfirmation` — "Pay on Delivery" language, cash amount emphasized.
- Admin: COD toggle + fee/min/max limits in Settings; COD badge on Orders list; "Mark Payment Collected" button (marks paid + decrements stock).
- Order detail: correct banner ("Pay on Delivery" vs "Order confirmed") + landmark/alt-phone display.

### 4. Google Sign-In (Supabase OAuth)
- Google buttons added to login & signup pages.
- New `app/auth/callback/route.js` handles the code exchange server-side and upserts a `profiles` row for new Google users.
- Requires external setup by user (see final summary).

### 5. Checkout expansion (`app/checkout/page.js`, `lib/validators.js`)
- Alternate phone, landmark, delivery notes/instructions, billing-same-as-shipping toggle.
- Address schema updated to accept optional `alt_phone` and `landmark`.

### 6. Admin product options (`app/admin/products/page.js`, `lib/validators.js`)
- Material / metal type, weight (grams), care instructions, low-stock threshold, set_group linkage, bestseller flag.

### 7. Admin categories (`app/admin/categories/page.js`)
- Full rewrite: banner image, short description (SEO), is_featured, edit support.
- API upsert added to `/api/admin/categories` POST.

### 8. Mobile menu (`components/site-header.js`)
- Drawer + backdrop moved OUT of `<header sticky>` to sibling position (was nested inside sticky's stacking context causing iOS Safari positioning quirks).
- Slides in from LEFT, dark backdrop overlay (tap-to-close), body scroll lock, correct z-index (backdrop z-60, drawer z-70).

### Migrations (SAFE / additive)
- `supabase/migration_features.sql` — only adds new columns, seeds COD defaults, never drops/alters existing data.
- Exposed at `/api/setup/migration-features` for copy-paste to Supabase SQL editor.

## Assumptions made
- COD max default set to ₹15,000 (common for jewellery brands to limit COD fraud/return-risk on high-value orders). Admin can change or set 0 to remove the limit.
- COD handling fee defaults to ₹0. Left it at zero so nothing changes for customers unless admin opts in.
- Stock is decremented **on COD collection** (not on order placement), to avoid inventory lock on possibly-refused COD parcels. Admin marks payment collected → stock decrements.
- Google OAuth uses `/auth/callback?next=<original-destination>` for the redirect.
- Mobile menu z-index bumped to 60/70 (was 40/50) to ensure it clears any other page overlays.

## Backlog / Future
- Product "set_group" is stored but the storefront doesn't yet render "shop the set" — could be a next feature.
- Low-stock threshold is stored per product; admin dashboard alert for low stock still uses the global default (per-product alert widget could be next).
- Category `banner_url` is stored; the actual category listing page should be updated to render it as the hero (deferred; storefront category page code was not changed this pass to keep the diff surgical).
