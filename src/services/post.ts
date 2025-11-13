import { supabase } from "../config/database";

export async function addPost(
  business_id: string,
  content: string,
  file: Express.Multer.File | undefined,
) {
  let imageUrl: string | null = null;

  if (file) {
    const fileExt = file.originalname.split(".").pop()?.toLowerCase();
    const allowed = ["png", "jpg", "jpeg", "webp"];
    if (!fileExt || !allowed.includes(fileExt)) {
      throw new Error("Unsupported image type");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new Error("Invalid file type");
    }
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error: storageError } = await supabase.storage
      .from("post-images")
      .upload(`posts/${fileName}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (storageError) {
      throw new Error(storageError.message);
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(`posts/${fileName}`);

    imageUrl = publicUrl;
  }
  const { data, error } = await supabase
    .from("posts")
    .insert({
      business_id,
      content,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deletePost(postId: string) {
  const post = await getPostById(postId);

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.image_url) {
    const urlParts = post.image_url.split("/post-images/");
    const relativePath = urlParts[1];

    const { error: storageError } = await supabase.storage
      .from("post-images")
      .remove([relativePath]);

    if (storageError) {
      throw new Error("Failed to delete image: " + storageError.message);
    }
  }

  const { data, error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return { message: "Post eliminado correctamente" };
}

export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}
export async function getAllPostBusiness(businessId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("business_id", businessId)
  if (error) throw new Error(error.message);

  return data;
}

export async function getAllPost() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
  if (error) throw new Error(error.message);

  return data;
}
