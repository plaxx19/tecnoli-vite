// src/lib/supabaseClient.js
// Las credenciales se leen de variables de entorno (archivo .env).
// Vite solo expone las que empiezan con VITE_.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;           // <-- SUPABASE_URL (en .env)
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;  // <-- SUPABASE_ANON_KEY (en .env)

export const isSupabaseConfigured = Boolean(
  url && /^https:\/\/.+\.supabase\.co/.test(url) && anonKey && anonKey.length > 20
);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

if (!isSupabaseConfigured) {
  console.warn("[Tecnoli] Supabase sin configurar. Revisa tu archivo .env");
}
