// supabaseClient.js
// -----------------------------------------------------------------------------
// Instala la dependencia en StackBlitz:  npm i @supabase/supabase-js
// (o agrégala a package.json: "@supabase/supabase-js": "^2")
//
// CONFIGURA TUS CREDENCIALES AQUÍ  (Supabase → Project Settings → API)
// En un proyecto Vite puedes usar variables de entorno (archivo .env):
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
// La anon key es pública, pero protege tus tablas con Row Level Security (RLS).
// -----------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://ibfkdbuahvbzhoqigeii.supabase.co';        // <-- SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RUq18PkAFzxMwUqzdmdamg_qQb2j6ky'; // <-- SUPABASE_ANON_KEY

/** true cuando ya reemplazaste los valores de ejemplo */
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('http') && !SUPABASE_ANON_KEY.startsWith('TU_');

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/*
-- SQL para crear la tabla (Supabase → SQL Editor)
create table public.products (
  id         bigint generated always as identity primary key,
  name       text    not null,
  category   text    not null,   -- tarjetas-graficas | procesadores | memorias-ram | fuentes-de-poder | perifericos
  price      numeric(10,2) not null,
  image_url  text,
  badge      text,               -- 'Más vendido' o null
  sales      integer default 0,  -- opcional: para ordenar los más vendidos
  created_at timestamptz default now()
);

alter table public.products enable row level security;
create policy "Lectura pública de productos"
  on public.products for select using (true);
*/