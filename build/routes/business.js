"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const business_1 = require("../controller/business");
const router = (0, express_1.Router)();
router.post("/register", business_1.registerBusiness);
router.post("/login", business_1.loginBusiness);
exports.default = router;
