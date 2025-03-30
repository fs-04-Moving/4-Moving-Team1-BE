"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./auth.route"));
const auth_middlewwaer_1 = require("../middlewear/auth.middlewwaer");
const router = express_1.default.Router();
router.use(auth_middlewwaer_1.authMiddleware);
router.use("/auth", auth_route_1.default);
exports.default = router;
