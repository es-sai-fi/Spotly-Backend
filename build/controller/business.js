"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBusiness = registerBusiness;
exports.loginBusiness = loginBusiness;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../services/auth");
const business_1 = require("../services/business");
async function registerBusiness(req, res) {
    try {
        const { email, name, busi_username, category, rating, description, address, password, } = req.body;
        if (!email || !name || !busi_username || !category || !password) {
            return res.status(400).json({
                error: "Faltan datos necesarios: nombre, correo, nombre de usuario, categoría, contraseña",
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== "string" || !emailRegex.test(email)) {
            return res.status(400).json({ error: "Email inválido" });
        }
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ error: "Nombre inválido" });
        }
        if (typeof category !== "string" || category.trim().length === 0) {
            return res.status(400).json({ error: "Categoría inválida" });
        }
        if (typeof busi_username !== "string" ||
            busi_username.trim().length === 0) {
            return res.status(400).json({ error: "Nombre de usuario inválido" });
        }
        const passwordStr = typeof password === "string"
            ? password
            : typeof password === "number"
                ? String(password)
                : null;
        if (!passwordStr || passwordStr.length < 8) {
            return res
                .status(400)
                .json({ error: "La contraseña debe tener al menos 8 caracteres" });
        }
        const forbiddenPatterns = [
            /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b)/i, // SQL keywords
            /(\bUNION\b|\bOR\b.*=.*\b|\bAND\b.*=.*\b)/i, // SQL injection patterns
            /['"`;\\]/g,
            /^\s+$/,
        ];
        const hasForbiddenPattern = forbiddenPatterns.some((pattern) => pattern.test(passwordStr));
        if (hasForbiddenPattern) {
            return res.status(400).json({
                error: "La contraseña contiene caracteres o patrones no permitidos",
            });
        }
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(passwordStr)) {
            return res.status(400).json({
                error: "La contraseña debe contener al menos una letra y un número",
            });
        }
        const existingEmail = await (0, business_1.getBusinessByEmail)(email);
        const existingUsername = await (0, business_1.getBusinessByUsername)(busi_username);
        if (existingEmail || existingUsername) {
            return res
                .status(409)
                .json({ error: "El email o nombre de usuario ya está registrado" });
        }
        const created = await (0, business_1.createBusiness)(email, name, busi_username, category, rating, description, address, passwordStr);
        const safeUser = created
            ? {
                id: created.id,
                name: created.name,
                busi_username: created.busi_username,
                email: created.email,
                category: created.category,
                description: created.description,
                address: created.address,
            }
            : null;
        return res.status(201).json(safeUser);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            return res.status(500).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: "Unexpected error occurred" });
    }
}
async function loginBusiness(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Missing parameters for login" });
        const business = await (0, business_1.getBusinessByEmail)(email);
        if (!business)
            return res.status(404).json({ error: "Business not found" });
        const validPassword = await bcrypt_1.default.compare(password, business.password);
        if (!validPassword)
            return res.status(400).json({ error: "Incorrect password" });
        const token = (0, auth_1.generateToken)({
            id: business.id,
            email: business.email,
            username: business.username,
        });
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: business.id,
                name: business.name,
                email: business.email,
                busi_username: business.busi_username,
                category: business.category,
                rating: business.rating,
                description: business.description,
                address: business.address,
            },
        });
    }
    catch {
        return res.status(500).json({ error: "Server error" });
    }
}
