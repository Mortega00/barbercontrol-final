import { createClient } from '@supabase/supabase-js'

// Vite cargará automáticamente estos valores desde tu archivo .env (en local)
// o desde las variables de entorno que configures en Vercel.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)