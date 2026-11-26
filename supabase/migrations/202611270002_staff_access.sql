create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'customer' check (role in ('customer','staff','admin')),
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid()=id);
create policy "Staff can read orders" on public.orders for select using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('staff','admin')));
create policy "Staff can update order status" on public.orders for update using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('staff','admin'))) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('staff','admin')));
-- Provision staff by inserting/updating profiles from a trusted admin workflow only.
-- Do not expose a profile-role mutation policy to ordinary authenticated users.