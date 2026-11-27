create table if not exists public.order_status_history (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 actor_user_id uuid references auth.users(id) on delete set null,
 from_status text,
 to_status text not null check (to_status in ('pending','confirmed','preparing','ready','completed','cancelled')),
 note text,
 changed_at timestamptz not null default now()
);
create index if not exists order_status_history_order_changed_idx
 on public.order_status_history(order_id, changed_at desc);

alter table public.order_status_history enable row level security;
create policy "Staff can read order status history"
 on public.order_status_history for select
 using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('staff','admin')));

create or replace function public.audit_order_status_change()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
 if tg_op='INSERT' then
  insert into public.order_status_history(order_id,actor_user_id,from_status,to_status)
  values(new.id,auth.uid(),null,new.status);
  return new;
 end if;

 if new.status is distinct from old.status then
  if not (
   (old.status='pending' and new.status in ('confirmed','cancelled')) or
   (old.status='confirmed' and new.status in ('preparing','cancelled')) or
   (old.status='preparing' and new.status in ('ready','cancelled')) or
   (old.status='ready' and new.status='completed')
  ) then
   raise exception 'Invalid order status transition: % -> %', old.status, new.status
    using errcode='22023';
  end if;
  insert into public.order_status_history(order_id,actor_user_id,from_status,to_status)
  values(new.id,auth.uid(),old.status,new.status);
 end if;
 return new;
end;
$$;

drop trigger if exists orders_status_audit_insert_trigger on public.orders;
drop trigger if exists orders_status_audit_update_trigger on public.orders;
create trigger orders_status_audit_insert_trigger
 after insert on public.orders
 for each row execute function public.audit_order_status_change();
create trigger orders_status_audit_update_trigger
 after update of status on public.orders
 for each row execute function public.audit_order_status_change();
