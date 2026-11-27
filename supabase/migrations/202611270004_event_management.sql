create table if not exists public.events (
 id text primary key,
 title text not null check (length(title) between 2 and 100),
 label text not null check (length(label) between 2 and 120),
 description text not null default '' check (length(description) <= 500),
 image text not null default '',
 event_date date,
 start_time time,
 end_time time,
 venue text not null default 'NOIR & EMBER' check (length(venue) <= 120),
 is_published boolean not null default false,
 is_featured boolean not null default false,
 sort_order integer not null default 0,
 updated_at timestamptz not null default now()
);
create index if not exists events_public_order_idx on public.events(is_published,event_date,sort_order);
alter table public.events enable row level security;
grant select on public.events to anon,authenticated;
grant all on public.events to service_role;
drop policy if exists "Public can view published events" on public.events;
create policy "Public can view published events" on public.events for select to anon,authenticated using (is_published=true);
insert into public.events(id,title,label,description,image,event_date,start_time,end_time,venue,is_published,is_featured,sort_order) values
('afterglow-sessions','Afterglow Sessions','Live music · Friday evenings','A soundtrack for lingering. Live sets, low lights, and a room that finds its rhythm.','https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=85',null,null,null,'NOIR & EMBER',false,true,10),
('the-long-table','The Long Table','Shared dining · Select weekends','A generous table, a menu made to share, and no reason to check the time.','https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85',null,null,null,'NOIR & EMBER',false,false,20),
('ember-after-hours','Ember After Hours','Late lounge · Monthly','A late-night mood shaped by carefully selected sounds and a softer kind of energy.','https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=85',null,null,null,'NOIR & EMBER',false,false,30)
on conflict(id) do nothing;