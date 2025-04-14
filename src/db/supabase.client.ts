import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// Default user for development purposes - using fixed UUID for testing
export const DEFAULT_USER_ID = "d1427744-ebf1-4276-a7c4-e9eede5d112d"; // Fixed UUID for development

// Custom type for Supabase client
export type SupabaseClient = ReturnType<typeof createClient<Database>>;

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
