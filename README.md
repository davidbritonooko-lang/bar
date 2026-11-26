# NOIR & EMBER

Premium dining & lounge concept: a cinematic black-and-antique-gold brand, menu browsing, events, and a customer order flow.

## Standout content direction
- **A table is only the beginning.** Narrative is built around lingering, shared plates, warm light, and evenings with their own rhythm.
- Menu copy is sensory and concise rather than generic.
- Events are framed as experiences (Afterglow Sessions, The Long Table, Ember After Hours), not a list of weekly promotions.
- Homepage CTA gives two paths: discover the menu or find an evening.
- All menu/event details are fictional and must be replaced or confirmed before launch.

## Stack
Next.js App Router, TypeScript, Tailwind CSS, Supabase Postgres, Zod.

## Local setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill Supabase project values.
4. Apply `supabase/migrations/202611270001_initial.sql` in the Supabase SQL editor or using the Supabase CLI.
5. Run `npm run dev`.

## Order flow
Menu items are source-of-truth validated server-side; prices are not trusted from the browser. The order route inserts into Supabase using a server-only service role key. Orders are unpaid and pending until a payment provider and staff workflow are configured. If Supabase credentials are missing, order submission fails closed with a setup message.

## Production blockers
- Configure Supabase project and apply migrations.
- Implement admin/staff authentication, role-based access, and protected order management.
- Integrate a payment provider (for Kenya, M-Pesa Daraja STK Push is a likely option) including signed/verified callback handling and reconciliation. This build does not claim live payment capability.
- Replace fictional content, image URLs, contact details, opening hours, event dates, and prices.
- Add operational notifications, privacy/terms, rate limiting, monitoring, backups, and run payment/order integration tests before launch.

## Commands
- `npm run dev`
- `npm run typecheck`
- `npm run build`
