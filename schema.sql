-- Supabase -> SQL Editor. Seguro de ejecutar varias veces.
create table if not exists public.products (
  id          bigint generated always as identity primary key,
  name        text not null,
  category    text not null,          -- 'Tarjetas gráficas' o 'tarjetas-graficas' (ambos funcionan)
  price       numeric(10,2) not null check (price >= 0),
  image_url   text,
  badge       text,                   -- 'Más vendido' o null
  best_seller boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Lectura publica de productos" on public.products;
create policy "Lectura publica de productos"
  on public.products for select using (true);

-- Si tu tabla ya existía sin la columna best_seller:
alter table public.products add column if not exists best_seller boolean not null default false;

-- Diagnóstico: ¿hay datos y políticas?
-- select count(*) from public.products;
-- select policyname, cmd from pg_policies where tablename = 'products';
