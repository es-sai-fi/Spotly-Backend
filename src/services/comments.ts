import { supabase } from "../config/database";

// Obtener todos los comentarios de un post
export async function getCommentsByPostId(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      users (
        id,
        email,
        username_id
      )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error en getCommentsByPostId:", error);
    throw new Error(`Error al obtener comentarios: ${error.message}`);
  }

  return data || [];
}

// Crear un nuevo comentario
export async function createComment(userId: string, postId: string, content: string) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: userId,
      post_id: postId,
      content: content.trim()
    })
    .select(`
      *,
      users (
        id,
        email,
        username_id
      )
    `)
    .single();

  if (error) {
    console.error("Error en createComment:", error);
    throw new Error(`Error al crear comentario: ${error.message}`);
  }

  return data;
}

// Eliminar un comentario (solo el autor puede eliminarlo)
export async function deleteComment(commentId: string, userId: string) {
  // Primero verificar que el comentario pertenece al usuario
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (fetchError) {
    throw new Error("Comentario no encontrado");
  }

  if (comment.user_id !== userId) {
    throw new Error("No tienes permiso para eliminar este comentario");
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error en deleteComment:", error);
    throw new Error(`Error al eliminar comentario: ${error.message}`);
  }

  return { message: "Comentario eliminado exitosamente" };
}
