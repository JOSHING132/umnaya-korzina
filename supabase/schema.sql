-- Черновая схема для подключения Supabase. Настройте RLS перед публикацией.
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  city text, district text, weekly_budget numeric(10,2) default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null, age int, sex text, height_cm numeric, weight_kg numeric,
  activity text, goal text, portion numeric default 1,
  allergies text[] default '{}', intolerances text[] default '{}',
  preferences jsonb not null default '{}'::jsonb
);
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  week_start date not null, plan jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.pantry (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  product_id text not null, quantity numeric not null default 0, unit text not null
);
create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  product_id text, name text not null, quantity numeric default 1,
  unit text default 'шт.', bought boolean not null default false
);
alter table public.households enable row level security;
alter table public.members enable row level security;
alter table public.plans enable row level security;
alter table public.pantry enable row level security;
alter table public.shopping_items enable row level security;
create policy "owner household access" on public.households for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "household member access" on public.members for all using (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid())) with check (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid()));
create policy "household plan access" on public.plans for all using (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid())) with check (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid()));
create policy "household pantry access" on public.pantry for all using (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid())) with check (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid()));
create policy "household shopping access" on public.shopping_items for all using (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid())) with check (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid()));
-- Branch directory used by the branch selector.
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  name text not null,
  city text not null,
  address text not null,
  lat double precision not null,
  lon double precision not null,
  created_at timestamptz not null default now()
);
create index if not exists branches_store_city_idx on public.branches(store_name, city);
alter table public.branches enable row level security;
drop policy if exists "branches are readable by everyone" on public.branches;
create policy "branches are readable by everyone" on public.branches for select using (true);
