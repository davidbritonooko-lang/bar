create extension if not exists pgcrypto;
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 order_number text not null unique,
 customer_name text not null,
 phone text not null,
 fulfillment text not null check (fulfillment in ('pickup','dine-in')),
 notes text,
 items jsonb not null check (jsonb_typeof(items)='array'),
 total_amount integer not null check (total_amount >= 0),
 payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded')),
 status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','completed','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
alter table public.orders enable row level security;
-- No client policies: order writes are performed through a server route using the service role.
-- Add authenticated staff policies only after staff identity and role management are configured.