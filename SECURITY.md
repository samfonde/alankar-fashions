# Aurelia — Security Checklist

Items marked ✅ are implemented in this build.

## Authentication & Sessions
- ✅ Supabase Auth (no custom password hashing)
- ✅ Server-side session refresh via middleware (rotates refresh tokens)
- ✅ Cookie-based sessions with `HttpOnly` (handled by Supabase SSR)
- ✅ Email verification supported (enable in Supabase Auth settings)
- ✅ Passwords never logged

## Row Level Security (RLS)
- ✅ RLS enabled on every table in `public` schema
- ✅ Policies:
  - `profiles`: user reads/updates own row; admin reads all
  - `addresses`, `wishlists`: owner-only
  - `categories`, `products`, `homepage_sections`: public read (published/active), admin write
  - `product_variants`: public read, admin write
  - `orders` / `order_status_history`: owner read, admin all
  - `reviews`: public read; owner insert; owner or admin delete
  - `coupons`: public read active; admin write
  - `admin_audit_log`, `settings`: admin only
- ✅ `is_admin()` helper function via `SECURITY DEFINER` for policy checks

## Payment Security
- ✅ Razorpay **hosted checkout** – no card data ever hits our servers
- ✅ Order creation validates prices and stock **server-side** (never trusts client)
- ✅ `razorpay_signature` verified with HMAC-SHA256 on `/api/checkout/verify`
- ✅ Webhook signature verified with `X-Razorpay-Signature` on `/api/webhooks/razorpay`
- ✅ Webhook is the source of truth (client callback is a UX aid, not authoritative)
- ✅ Razorpay keys stored server-side; live key toggle in admin settings

## Input Validation
- ✅ Zod schemas on every write endpoint (`authSchema`, `checkoutSchema`, `productSchema`, `addressSchema`, `reviewSchema`)
- ✅ All inputs sanitized before insertion (Supabase parameterized queries)
- ✅ Rate limits applied to: `/auth/signup`, `/auth/login`, `/checkout/create`, `/search/suggest`

## Admin Isolation
- ✅ Every `/api/admin/*` route calls `requireAdmin()` – server-side role check
- ✅ Admin panel layout also checks role on the client, but authorization is enforced at the API
- ✅ All admin writes recorded in `admin_audit_log` with `admin_id`, `admin_email`, `action`, `entity`, `entity_id`, `changes`

## Secrets Management
- ✅ `.env` never committed (add to `.gitignore`)
- ✅ `.env.example` provided with all required keys blank
- ✅ `SUPABASE_SERVICE_ROLE_KEY` used only server-side (never in `NEXT_PUBLIC_*`)
- ✅ Razorpay secret loaded from settings table or env, never sent to client

## Headers & Transport
- ✅ Middleware sets `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`
- ✅ CORS configurable via `CORS_ORIGINS` env
- ✅ Assume HTTPS is terminated at Hostinger / Cloudflare

## File Uploads
- ✅ Server validates content type (`image/*`) and size (≤ 5 MB)
- ✅ Uploads go to Supabase Storage bucket `product-images` (public read)
- ✅ Only admins can hit the upload endpoint

## Rate Limits
- Login: 10 attempts / minute / IP
- Signup: 5 / minute / IP
- Checkout create: 20 / minute / IP
- Search suggest: 30 / minute / IP

## Before Going Live
1. Change the default admin password from `AureliaAdmin!2026` after first login.
2. In Supabase Auth settings, enable **email confirmations** if not already on.
3. Set `CORS_ORIGINS` to your production domain (not `*`).
4. Rotate the Supabase service role key if it was shared in any chat/log.
5. Switch Razorpay from test to live keys via `/admin/settings`.
6. Configure a real `RESEND_FROM_EMAIL` on a verified domain in Resend.
