"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedOnly = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const authMiddleware = (req, res, next) => {
    try {
        if (req.url === "/auth/signUp" || req.url === "/auth/lo")
            return next();
        const token = req.headers.authorization;
        if (!token) {
            return next();
        }
        const accessToken = token.split("Bearer ")[1];
        if (!jwtSecretKey) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const { sub } = jsonwebtoken_1.default.verify(accessToken, jwtSecretKey);
        if (typeof sub !== "string") {
            throw new Error("sub is not string");
        }
        req.userId = sub;
        next();
    }
    catch (e) {
        next(e);
    }
};
exports.authMiddleware = authMiddleware;
const authenticatedOnly = (req, res, next) => {
    try {
        const userId = req.userId;
        const isAuthenticated = !!userId;
        if (!isAuthenticated)
            throw new Error("401/Unauthenticated");
        next();
    }
    catch (e) {
        next(e);
    }
};
exports.authenticatedOnly = authenticatedOnly;
