// src/lib/supabaseClient.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// PERBAIKAN: Fungsi ini tidak memerlukan argumen,
// ia akan otomatis membaca variabel dari .env.local
export const supabase = createClientComponentClient()
