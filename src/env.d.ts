/// <reference types="astro/client" />

import type { supabaseClient } from "./db/supabase.client";
interface User {
  email: string;
  id: string;
}
declare global {
  namespace App {
    interface Locals {
      supabase: typeof supabaseClient;
      user?: User;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
