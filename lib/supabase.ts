
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL en el entorno de compilación')
}

if (!supabaseKey) {
  throw new Error('Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno de compilación')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
