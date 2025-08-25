// src/lib/supabaseClient.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

// Ekspor instance untuk penggunaan umum di Client Components
export const supabase = createClientComponentClient<Database>()

// Ekspor fungsi createClientComponentClient itu sendiri untuk penggunaan yang lebih fleksibel jika diperlukan
export { createClientComponentClient }