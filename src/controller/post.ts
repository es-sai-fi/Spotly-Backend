import { Request, Response } from "express";
import { 
  addPost, 
  deletePost, 
  getPostById,
  getAllPost,
  getAllPostBusiness,
 } from "../services/post";
import { getBusinessById } from "../services/business";

export async function createPostController(req: Request, res: Response) {
  try {
    const { businessId, content } = req.body;
    const file = req.file;

    if (!businessId) {
      return res.status(400).json({ error: "El negocio es requerido" });
    }

    const postData = await addPost(businessId, content, file);

    if (!postData) {
      return res
        .status(400)
        .json({ error: "No se pudo obtener la información" });
    }
    return res
      .status(200)
      .json({ message: "Publicacion creada exitosamente", postData });
  } catch (err:any) {
    return res.status(400).json({ error:err.message  });
  }
}

export async function deletePostController(req: Request, res: Response) {
  try {
    const postId = req.params.postId;

    const validPost = await getPostById(postId);
    if (!validPost) {
      return res.status(404).json({ error: "Publicacion no encontrada" });
    }

    const result = deletePost(postId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: "Error al eliminar la publicacion" });
  }
}

export async function getAllPostBusinessController(req: Request, res: Response) {
  try{
    const business_id = req.body;
    const validBusiness = await getBusinessById(business_id);
    if(!validBusiness){
      return res.status(404).json({message:"No existe el negocio"});
    }
    const postBusiness = await getAllPostBusiness(business_id);
    if(!postBusiness){
      return res.status(400).json({error:"Error al obtener publicaciones"})
    }
    return res.status(200).json({message:"Publicaciones encontradas",data:postBusiness})
  }catch(err:any){
     return res.status(400).json({ error:"Error al obtener Post" });
    }
}
export async function getAllPostController(req: Request, res: Response) {
  try{ 
      const allPost = await getAllPost();
      return res.status(200).json({data:allPost});
}
  catch (err:any) {
    return res.status(400).json({ error:"Error al obtener publicaciones" });
  }
}