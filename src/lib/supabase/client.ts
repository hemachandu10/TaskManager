import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./types";
import { getSupabaseConfig } from "./config";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (client) return client;
  const { url, key } = getSupabaseConfig();
  client = createBrowserClient<Database>(url, key);
  return client;
}
