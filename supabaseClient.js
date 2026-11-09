// Cliente de Supabase. En StackBlitz instala @supabase/supabase-js (incluido en package.json).
import { createClient } from "@supabase/supabase-js";

// 1) Crea un proyecto en https://supabase.com
// 2) En Project Settings > API copia Project URL y la clave anon/public.
// 3) Sustituye estos valores. Nunca coloques aquí la service_role key.
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY";

const hasSupabaseConfig =
  SUPABASE_URL.startsWith("https://ibfkdbuahvbzhoqigeii.supabase.co") &&
  !SUPABASE_URL.includes("Tecnoli DB") &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes("sb_publishable_RUq18PkAFzxMwUqzdmdamg_qQb2j6ky");

export const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseConfigured = Boolean(supabase);
