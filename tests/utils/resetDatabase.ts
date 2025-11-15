import { supabase } from "../../src/config/database";

export async function resetDatabase() {
  console.log("Resetting database...\n");

  const tables = [
    "comments",
    "user_post",
    "favorites",
    "reviews",
    "posts",
    "businesses",
    "users",
    "usernames",
  ];

  for (const table of tables) {
    try {
      const filterColumn = ["user_post", "favorites"].includes(table)
        ? "user_id" : "id";

      const { error } = await supabase
        .from(table)
        .delete()
        .not(filterColumn, "is", null)
        .select("*");

      if (error) {
        console.error(`Error deleting from ${table}: ${error.message}`);
      } else {
        console.log(`Cleared ${table}`);
      }
    } catch (err) {
      console.error(`Unexpected error in ${table}:`, err);
    }
  }

  console.log("\nDatabase reset completed successfully");
}

if (require.main === module) {
  resetDatabase();
}
