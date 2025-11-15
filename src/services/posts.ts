import { supabase } from "../config/database";

// Helper para contar likes de un post
async function countLikes(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from("user_post")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    console.error("Error contando likes:", error);
    return 0;
  }

  return count || 0;
}

// Helper para contar comentarios de un post
async function countComments(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    console.error("Error contando comentarios:", error);
    return 0;
  }

  return count || 0;
}

// Obtener todos los posts ordenados por fecha (más reciente primero)
export async function getAllPosts() {
  const { data, error } = await supabase
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
    console.error("Error en getAllPosts:", error);
    throw new Error(`Error al obtener posts: ${error.message} - ${error.details || ''} - ${error.hint || ''}`);
  }
  
  // Agregar el count de likes y comentarios a cada post
  const postsWithCounts = await Promise.all(
    (data || []).map(async (post) => {
      const [likesCount, commentsCount] = await Promise.all([
        countLikes(post.id),
        countComments(post.id)
      ]);
      return {
        ...post,
        likes: likesCount,
        commentsCount: commentsCount
      };
    })
  );
  
  return postsWithCounts;
}

// Obtener posts de un negocio específico
export async function getPostsByBusinessId(businessId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      businesses (
        id,
        name,
        category
      )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  
  const postsWithLikes = data?.map(post => ({
    ...post,
    likes: post.likes || 0
  })) || [];
  
  return postsWithLikes;
}

// Obtener un post por ID
export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      businesses (
        id,
        name,
        category
      )
    `)
    .eq("id", postId)
    .single();

  if (error) throw new Error(error.message);
  
  // Asegurar que likes existe
  if (data) {
    return {
      ...data,
      likes: data.likes || 0
    };
  }
  
  return data;
}

// Crear un nuevo post
export async function createPost(businessId: string, content: string) {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      business_id: businessId,
      content: content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error en createPost:", error);
    throw new Error(`Error al crear post: ${error.message}`);
  }

  return data;
}
