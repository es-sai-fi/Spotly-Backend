"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBusiness = createBusiness;
exports.getBusinessByEmail = getBusinessByEmail;
exports.getBusinessByUsername = getBusinessByUsername;
exports.editBusinessById = editBusinessById;
exports.deleteBusiness = deleteBusiness;
const database_1 = require("../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function createBusiness(email, name, busi_username, category, rating, description, address, password) {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const { data, error } = await database_1.supabase
        .from("businesses")
        .insert([
        {
            email,
            name,
            busi_username,
            category,
            rating,
            description,
            address,
            password: hashedPassword,
        },
    ])
        .select();
    if (error)
        throw new Error(error.message);
    return data[0];
}
async function getBusinessByEmail(email) {
    const { data, error } = await database_1.supabase
        .from("businesses")
        .select("*")
        .eq("email", email)
        .maybeSingle();
    if (error)
        throw new Error(error.message);
    return data;
}
async function getBusinessByUsername(busi_username) {
    const { data, error } = await database_1.supabase
        .from("businesses")
        .select("*")
        .eq("busi_username", busi_username)
        .maybeSingle();
    if (error)
        throw new Error(error.message);
    return data;
}
async function editBusinessById(business_id, updates) {
    const { data, error } = await database_1.supabase
        .from("businesses")
        .update(updates)
        .eq("id", business_id)
        .select()
        .maybeSingle();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}
async function deleteBusiness(business_id) {
    const { data, error } = await database_1.supabase
        .from("businesses")
        .delete()
        .eq("id", business_id)
        .maybeSingle();
    if (error) {
        throw new Error(error.message);
    }
}
