import { supabase } from "../../src/config/database";

export async function resetDatabase() {
  await supabase.from("usernames").delete().neq("id", "");
  await supabase.from("users").delete().neq("id", "");
  await supabase.from("posts").delete().neq("id", "");
  await supabase.from("business").delete().neq("id", "");
  await supabase.from("comments").delete().neq("id", "");
  await supabase.from("user_business").delete().neq("id", "");
  await supabase.from("user_post").delete().neq("id", "");
  await supabase.from("user_reviews").delete().neq("id", "");

  console.log("Database reset successfully");
}

if (require.main === module) {
  resetDatabase();
}
