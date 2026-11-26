create table if not exists public.menu_items (
 id text primary key,
 name text not null check (length(name) between 2 and 100),
 description text not null default '' check (length(description) <= 500),
 price integer not null check (price >= 0),
 category text not null check (category in ('small plates','from the fire','comfort','sides','zero-proof')),
 image text not null default '',
 tag text,
 is_available boolean not null default true,
 is_published boolean not null default true,
 sort_order integer not null default 0,
 updated_at timestamptz not null default now()
);
create index if not exists menu_items_public_order_idx on public.menu_items(is_published,sort_order);
alter table public.menu_items enable row level security;
grant select on public.menu_items to anon,authenticated;
grant all on public.menu_items to service_role;
drop policy if exists "Public can view published menu" on public.menu_items;
create policy "Public can view published menu" on public.menu_items for select to anon,authenticated using (is_published=true);
insert into public.menu_items(id,name,description,price,category,image,tag,is_available,is_published,sort_order) values
('ember-wings','Ember-glazed wings','Charred edges, tamarind honey glaze, toasted sesame, cooling herb dip.',980,'small plates','https://images.unsplash.com/photo-1527471304084-7e3b7b7c4a0?auto=format&fit=crop&w=1000&q=85','House favourite',true,true,10),
('crispy-cauliflower','Crisp cauliflower','Golden florets, smoked paprika, lemon tahini, fresh herbs.',720,'small plates','https://images.unsplash.com/photo-1568584711271-6c929fb49e9d?auto=format&fit=crop&w=1000&q=85',null,true,true,20),
('fire-ribeye','Fire-cut steak','Pepper crust, resting butter, blistered seasonal greens.',2450,'from the fire','https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85','Signature',true,true,30),
('ember-chicken','Ember-roast chicken','Slow-roasted, citrus-brushed, served with a silky pan jus.',1680,'from the fire','https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=85',null,true,true,40),
('mushroom-rice','Wild mushroom rice','Fragrant rice, mushrooms, garlic, thyme, parmesan finish.',1250,'comfort','https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1000&q=85','Vegetarian',true,true,50),
('smash-burger','The midnight smash','Double-seared beef, sharp cheddar, ember onions, house sauce.',1450,'comfort','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85',null,true,true,60),
('truffle-fries','Truffle & parmesan fries','Hand-cut fries, truffle oil, aged parmesan, cracked pepper.',650,'sides','https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1000&q=85',null,true,true,70),
('citrus-soda','Citrus garden fizz','Fresh citrus, rosemary, sparkling water, a bright finish.',480,'zero-proof','https://images.unsplash.com/photo-1513558161293-cdaf765edfd47?auto=format&fit=crop&w=1000&q=85','Zero-proof',true,true,80),
('ginger-pineapple','Ginger & pineapple cooler','Pineapple, ginger, lime, and a little heat.',520,'zero-proof','https://images.unsplash.com/photo-1536935338788846-b5c3f8a2d7a1?auto=format&fit=crop&w=1000&q=85',null,true,true,90)
on conflict(id) do nothing;