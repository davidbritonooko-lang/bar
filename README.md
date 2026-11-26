# NOIR & EMBER

An editorial restaurant and lounge concept built around the line **A table is only the beginning.** The experience uses cinematic imagery, restrained antique-gold details, sensory menu copy, and event storytelling rather than generic hospitality template language.

## Included
- Responsive home, menu, and event experiences with premium black / antique-gold visual identity.
- Searchable-by-category menu filtering and a local-storage cart.
- Server-side order validation and authoritative menu pricing.
- Supabase order persistence with order/payment status fields.
- Staff sign-in and protected order dashboard.
- Staff order-status updates with role checks and Row Level Security.
- Demo menu and event copy; all details are fictional and must be replaced/confirmed.

## Stack
Next.js App Router, React, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Zod.

## Local setup
1. Use Node.js 20 or newer.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env.local`, then add the Supabase project URL, anon key, and service-role key.
4. Apply migrations in order from `supabase/migrations/`.
5. Run `npm run dev`.
6. Check `npm run typecheck` and `npm run build`.

## Supabase setup
- Create the Supabase project and apply both SQL migrations.
- Create staff users through Supabase Auth.
- Provision each authorized staff account from a trusted SQL editor, replacing the UUID with the user's Auth ID:
  ```sql
  insert into public.profiles (id, role)
  values ('AUTH_USER_UUID', 'admin')
  on conflict (id) do update set role = excluded.role;
  ```
- The profile role table has no client-side role mutation policy. Do not grant staff roles from public signup or browser code.
- The service-role key is server-only and must never be prefixed with `NEXT_PUBLIC_`.

## Ordering behavior
The cart is client-side and persisted in the browser. On submit, the server validates item IDs and quantities against its menu source and calculates prices itself. Orders are saved as pending and unpaid. If Supabase is not configured, the API fails closed and the UI reports that order submission is unavailable.

## Admin
Visit `/admin/login`. Admin/staff authorization is checked server-side in the API and enforced by database policies. The dashboard displays recent orders and allows staff to update operational status. Staff role provisioning is manual and trusted.

## Menu management\n- Apply migration `202611270003_menu_management.sql`.\n- `/admin/menu` allows staff to create, edit, publish, unpublish, and toggle item availability.\n- Public menu and server-side order pricing read published database items; unavailable items cannot be ordered.\n\n## Not live yet — required before production
- **Payments:** M-Pesa/card gateway is not integrated. Payment fields are status placeholders only. Add gateway initiation, provider callback verification, transaction reconciliation, idempotency, and sandbox/live tests before accepting paid orders.
- **Rate limiting and abuse controls:** protect order creation and auth endpoints with a durable rate limiter.
- **Notifications:** email/SMS/WhatsApp confirmations and staff alerts.
- **Customer order tracking:** customer-safe order status lookup using secure order tokens.
- **Menu/events CMS:** current menu and event content is source-controlled concept data, not editable from admin yet.
- Replace fictitious items, prices, imagery, event formats, contacts, venue details, hours, and all copy that depends on real operations.
- Add privacy notice, terms, accessibility audit, image rights review, monitoring, backup/recovery validation, and deployment secrets.
- Run integration tests with a configured Supabase project and verify role/RLS boundaries.

## Scripts
- `npm run dev`
- `npm run typecheck`
- `npm run build`
