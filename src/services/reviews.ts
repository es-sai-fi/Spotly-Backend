import { supabase } from "../config/database";

export async function getReviewsBusiness(businessId:string) {
    const {data , error} =await supabase
    .from("reviews")
    .select("*")
    .eq("business_id",businessId);
    if(error) throw new Error(error.message);
    return data;
}
export async function getAllReviewsBusiness() {
    const {data , error} =await supabase
    .from("reviews")
    .select("*")
    if(error) throw new Error(error.message);
    return data;
}


export async function upsertReviewsBusiness(
    user_id:string,
    business_id:string,
    content:string,
    ) {
    const updates= {
        user_id, 
        business_id,
        content}
    const {data, error} = await supabase
    .from("reviews")
    .upsert(updates)
    .select()
    .maybeSingle();

    if(error) throw new Error(error.message);
    
    return data;

}
export async function upsertRatingBusiness(   
    user_id:string,
    business_id:string,
    rating:number,
    ) {
    const updates= {
        user_id, 
        business_id,
        rating
    }
    const {data, error} = await supabase
    .from("reviews")
    .upsert(updates)
    .select()
    .maybeSingle();
    
    if(error) { throw new Error(error.message);}
    return data;
}
export async function deleteReview(userId:string) {
    const {data,error}= await supabase
    .from("reviews")
    .delete()
    .eq("user_id", userId)
    .select();
    if(error) throw new Error(error.message);
    return data[0];   
}