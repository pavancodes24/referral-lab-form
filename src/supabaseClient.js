import { createClient } from '@supabase/supabase-js';

// Replace with your own values from the Supabase dashboard
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
