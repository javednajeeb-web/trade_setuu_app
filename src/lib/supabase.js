import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tdkvikabilrjsbmctehe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_akArQCNGZ3uMnZ82jmHKAQ_XlkhU0A9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
