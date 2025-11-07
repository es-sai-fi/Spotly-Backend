"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.updateAUser = updateAUser;
exports.deleteUserController = deleteUserController;
exports.changePasswordController = changePasswordController;
exports.getUserByIdController = getUserByIdController;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../services/user");
const auth_1 = require("../services/auth");
async function registerUser(req, res) {
    try {
        const { email, name, surname, age, password, username } = req.body;
        if (!email) {
            return res.status(400).json({
                error: "Falta proporcionar el Email",
            });
        }
        else if (age === undefined) {
            return res.status(400).json({
                error: "Falta proporcionar la edad",
            });
        }
        else if (!password) {
            return res.status(400).json({
                error: "Falta proporcionar la contraseña",
            });
        }
        if (!name || !surname) {
            return res.status(400).json({
                error: "Proporcione el nombre completo",
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== "string" || !emailRegex.test(email)) {
            return res.status(400).json({ error: "Email inválido" });
        }
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ error: "Nombre inválido" });
        }
        const ageNum = Number(age);
        if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
            return res.status(400).json({ error: "Edad inválida" });
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
        const existingEmail = await (0, user_1.getUserByEmail)(email);
        const existingUsername = await (0, user_1.getUserByUsername)(username);
        if (existingEmail || existingUsername) {
            return res
                .status(409)
                .json({ error: "El email o nombre de usuario ya está registrado" });
        }
        const created = await (0, user_1.createUser)(email, name, username, surname, ageNum, passwordStr);
        const safeUser = created
            ? {
                id: created.id,
                email: created.email,
                username: created.username,
                name: created.name,
                age: created.age,
            }
            : null;
        return res.status(201).json(safeUser);
    }
    catch {
        return res.status(500).json({ error: "Error del servidor" });
    }
}
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        if (!email)
            return res.status(400).json({ error: "El email no ha sido proporcionado" });
        if (!password) {
            return res.status(400).json({ error: "La contraseña no ha sido proporcionada" });
        }
        const user = await (0, user_1.getUserByEmail)(email);
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json({ error: "Contraseña incorrecta" });
        const token = (0, auth_1.generateToken)({
            id: user.id,
            email: user.email,
            username: user.username,
        });
        return res.status(200).json({
            message: "Login exitoso",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                surname: user.surname,
                age: user.age,
            },
        });
    }
    catch {
        return res.status(500).json({ error: "Error del servidor" });
    }
}
async function updateAUser(req, res) {
    try {
        const { userId } = req.params;
        const body = req.body;
        const toUpdate = {};
        if (typeof body.name === "string")
            toUpdate.name = body.name;
        if (typeof body.surname === "string")
            toUpdate.surname = body.surname;
        if (typeof body.email === "string")
            toUpdate.email = body.email;
        if (typeof body.username === "string")
            toUpdate.username = body.username;
        if (typeof body.age === "number")
            toUpdate.age = body.age;
        const updatedUser = await (0, user_1.updateUser)(userId, toUpdate);
        return res.status(200).json({
            message: "Usuario actualizado exitosamente",
            updatedUser,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: "Error inesperado" });
    }
}
async function deleteUserController(req, res) {
    try {
        const { userId } = req.params;
        const userDelete = await (0, user_1.deleteUser)(userId);
        if (userDelete) {
            return res.status(400).json({ error: "Error al eliminar usuario" });
        }
        return res.status(200).json({ message: "Usuario eliminado correctamente" });
    }
    catch (error) {
        return res.status(400).json(error);
    }
}
async function changePasswordController(req, res) {
    const userId = req.params.userId;
    const { oldPassword, newPassword } = req.body;
    const Password = await (0, user_1.getUserById)(userId);
    if (oldPassword == newPassword) {
        return res.status(400).json({ error: "Las contraseñas son iguales" });
    }
    if (!Password) {
        return res.status(400).json({ error: "No se encontro el usuario" });
    }
    const actPasword = Password.password;
    const verify = await bcrypt_1.default.compare(oldPassword, actPasword);
    if (!verify) {
        return res.status(400).json({ error: "La contraseña actual no coincide" });
    }
    const passwordNew = await (0, user_1.changePassword)(userId, newPassword);
    if (!passwordNew) {
        return res.status(400).json({ error: "Error al cambiar la contraseña" });
    }
    return res.status(200).json({ message: "Contraseña Actualizada exitosamente" });
}
async function getUserByIdController(req, res) {
    try {
        const userId = req.params.userId;
        const user = await (0, user_1.getUserById)(userId);
        if (!user) {
            return res.status(400).json({ error: "No existe el usuario" });
        }
        return res.status(200).json({ message: "Usuario encontrado", user });
    }
    catch (error) {
    }
}
