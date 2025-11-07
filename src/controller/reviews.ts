import { error } from "console";
import{
    getReviewsBusiness,
    upsertRatingBusiness,
    upsertReviewsBusiness,
    deleteReview,
    getAllReviewsBusiness
} from "../services/reviews"
import {getUserById} from "../services/user"
import {getBusinessById} from "../services/business"
import { Request, Response } from "express";

export async function getReviewsBusinessByIdController(req:Request, res:Response) {
    try{
        const {businessId}= req.body;

        const validBusiness = await getBusinessById(businessId);

        if(!validBusiness){
            return res.status(404).json({error:"Negocio no encontrado"});
        }
        const reviews = await getReviewsBusiness(businessId);

        if(!reviews){
            return res.status(400).json({error:"No se pudo obtener la informacion"});
        }
        return res.status(200).json({message:"Reviews obtenidos", reviews })

    }catch(error){
        return res.status(400).json({error:"No se obtuvieron las reseñas"})
    }
}

export async function getAllReviewsBusinessController(req: Request, res: Response) {
  try {
    const reviews = await getAllReviewsBusiness();
    return res.status(200).json({ reviews });
  } catch (err: any) {
    
    return res.status(400).json({ error: err.message });
  }
}

export async function upsertReviewBusinessController(req:Request, res:Response) {
    try{
        const userId = req.params.userId;
        const {businessId , content}= req.body;
        const validUser = await getUserById(userId);
       
        if(!validUser){
            return res.status(404).json({error:"Usuario no encontrado"});
        }
        
        const validBusiness = await getBusinessById(businessId);
        if(!validBusiness){
            return res.status(404).json({error:"Negocio no encontrado"});
        }
         
        const review = await upsertReviewsBusiness(userId,businessId,content);
       
        if (!review){
            return res.status(400).json({error:"Error al comentar"});
        }
        
        return res.status(200).json({message:"Reseña agregada exitosamente"});
    } catch(err:any){
        return res.status(400).json({ error: err.message || err });
}
}

export async function upsertRatingBusinessController(req:Request, res:Response) {
    try{
        const userId = req.params.userId;
        const {businessId,rating}= req.body;
        const validUser = await getUserById(userId);
        if(!validUser){
            return res.status(404).json({error:"Usuario no encontrado"});
        }
        const validBusiness = await getBusinessById(businessId);
        if(!validBusiness){
            return res.status(404).json({error:"Negocio no encontrado"});
        }
        const review = await upsertRatingBusiness(userId,businessId,rating);
        if (!review){
            return res.status(400).json({error:"Error al calificar"});
        }
        return res.status(200).json({message:"Calificacion agregada exitosamente"});
    } catch(err:any){
         return res.status(400).json({ error: err.message || err });
}
}
export async function deleteReviewBusinessController (req:Request, res:Response) {
    try{
        const userId = req.params.userId;
        const validUser = await getUserById(userId);
        if(!validUser){
            return res.status(404).json({error:"Usuario no encontrado"});
        }
        const delReview = await deleteReview(userId);    
        if (!delReview) {
             return res.status(400).json({error:"No se pudo eliminar la reseña"});
        }
        return res.status(400).json({message:"Reseña eliminada correctamente"})
        
    } catch(err){
        return res.status(400).json({error:"error al eliminar reseña"});
    }
}