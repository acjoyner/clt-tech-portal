import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This creates a single instance of the Supabase client 
// that you can import into any component.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

