"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const user_1 = __importDefault(require("./routes/user"));
const business_1 = __importDefault(require("./routes/business"));
dotenv_1.default.config();
const app = (0, express_1.default)();
if (!process.env.PORT) {
    process.exit(1);
}
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/users", user_1.default);
app.use("/api/businesses", business_1.default);
app.get("/", (_req, res) => {
    res.send("Backend API is running 🚀");
});
exports.default = app;
