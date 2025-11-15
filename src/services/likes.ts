import { supabase } from "../config/database";

// Obtener el número de likes de un post
export async function getLikesCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from("user_post")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    console.error("Error en getLikesCount:", error);
    return 0;
  }

  return count || 0;
}

// Verificar si un usuario dio like a un post
export async function hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_post")
    .select("*")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
    console.error("Error en hasUserLikedPost:", error);
  }

  return !!data;
}

// Dar like a un post
export async function likePost(userId: string, postId: string) {
  // Verificar si ya dio like
  const alreadyLiked = await hasUserLikedPost(userId, postId);
  
  if (alreadyLiked) {
    throw new Error("Ya diste like a este post");
  }

  const { error } = await supabase
    .from("user_post")
    .insert({
      user_id: userId,
      post_id: postId
    });

  if (error) {
    console.error("Error en likePost:", error);
    throw new Error(`Error al dar like: ${error.message}`);
  }

  return { message: "Like agregado exitosamente" };
}

// Quitar like de un post
export async function unlikePost(userId: string, postId: string) {
  const { error } = await supabase
    .from("user_post")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId);

  if (error) {
    console.error("Error en unlikePost:", error);
    throw new Error(`Error al quitar like: ${error.message}`);
  }

  return { message: "Like eliminado exitosamente" };
}

// Obtener posts con información de likes para un usuario específico
export async function getPostsWithLikeStatus(userId?: string) {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      *,
      businesses (
        id,
        name,
        category
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error en getPostsWithLikeStatus:", error);
    throw new Error(`Error al obtener posts: ${error.message}`);
  }

  // Para cada post, obtener el count de likes y si el usuario dio like
  const postsWithLikes = await Promise.all(
    (posts || []).map(async (post) => {
      const likesCount = await getLikesCount(post.id);
      const userLiked = userId ? await hasUserLikedPost(userId, post.id) : false;

      return {
        ...post,
        likes: likesCount,
        userLiked
      };
    })
  );

  return postsWithLikes;
}
