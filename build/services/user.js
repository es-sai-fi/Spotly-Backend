"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUserByEmail = getUserByEmail;
exports.getUserById = getUserById;
exports.getUserByUsername = getUserByUsername;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.changePassword = changePassword;
const database_1 = require("../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function createUser(email, name, username, surname, age, password) {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const { data, error } = await database_1.supabase
        .from("users")
        .insert([{ email, name, surname, username, age, password: hashedPassword }])
        .select();
    if (error)
        throw new Error(error.message);
    return data[0];
}
async function getUserByEmail(email) {
    const { data, error } = await database_1.supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();
    if (error)
        throw new Error(error.message);
    return data;
}
async function getUserById(id) {
    const { data, error } = await database_1.supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error)
        throw new Error(error.message);
    return data;
}
async function getUserByUsername(username) {
    const { data, error } = await database_1.supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .maybeSingle();
    if (error)
        throw new Error(error.message);
    return data;
}
async function updateUser(id, updates) {
    const { data, error } = await database_1.supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();
    if (error)
        throw new Error(error.message);
    return data;
}
async function deleteUser(user_id) {
    const { data, error } = await database_1.supabase
        .from("users")
        .delete()
        .eq("id", user_id);
    if (error)
        throw new Error(error.message);
}
async function changePassword(id, newPassword) {
    try {
        const user = await getUserById(id);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        const { data, error } = await database_1.supabase
            .from("users")
            .update({ password: hashedPassword })
            .eq("id", id)
            .select();
        if (error)
            throw new Error(error.message);
        return data[0];
    }
    catch (err) {
        throw new Error(err.message);
    }
}
