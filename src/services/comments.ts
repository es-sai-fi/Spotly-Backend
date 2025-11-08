import { supabase } from "../config/database";


export async function getCommentsByPost(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}


export async function getAllComments() {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}


export async function addComment(
  user_id: string,
  post_id: string,
  content: string
) {
  const newComment = {
    user_id,
    post_id,
    content,
  };

  const { data, error } = await supabase
    .from("comments")
    .insert(newComment)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}


export async function updateComment(
  commentId: string,
  content: string
) {
  const { data, error } = await supabase
    .from("comments")
    .update({ content })
    .eq("id", commentId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}


export async function deleteComment(commentId: string) {
  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
