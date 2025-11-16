import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL) {
    throw new Error("Missing required environment variable: SUPABASE_URL");
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
