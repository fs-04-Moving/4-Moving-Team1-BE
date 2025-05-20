"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedWithRefresh = exports.workerOnly = exports.customerOnly = exports.authenticatedOnly = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../db/prisma/client"));
const jwtSecretKey = process.env.JWT_SECRET_KEY;
if (!jwtSecretKey) {
    throw new Error("jwtSerectKey is not exist");
}
const authMiddleware = (req, res, next) => {
    try {
        if (req.url === "/auth/sign-up" ||
            req.url === "/auth/log-in" ||
            req.url === "/auth/refresh-token" ||
            req.url === "/kakao/callback" ||
            req.url === "/kakao")
            return next();
        if (!jwtSecretKey) {
            throw new Error("401/JWT_SECRET is not defined in environment variables");
        }
        const headerToken = req.headers.authorization;
        const cookieToken = req.cookies.accessToken;
        //헤더로 오는경우
        if (headerToken) {
            const accessToken = headerToken.split("Bearer ")[1];
            const { sub } = jsonwebtoken_1.default.verify(accessToken, jwtSecretKey);
            if (typeof sub !== "string") {
                throw new Error("400/sub is not string");
            }
            console.log("헤더로 토큰이 왔습니다!");
            req.userId = sub;
        }
        // 쿠키로 오는경우
        else if (cookieToken) {
            const payload = jsonwebtoken_1.default.verify(cookieToken, jwtSecretKey);
            console.log("쿠키로 토큰이 왔습니다!:", cookieToken);
            req.userId = payload.sub;
        }
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
const customerOnly = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield client_1.default.user.findFirstOrThrow({ where: { id: userId } });
        if (user.role === "customer") {
            next();
        }
        else {
            throw new Error("403/Unauthenticated : user only");
        }
    }
    catch (e) {
        next(e);
    }
});
exports.customerOnly = customerOnly;
const workerOnly = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield client_1.default.user.findFirstOrThrow({ where: { id: userId } });
        if (user.role === "worker") {
            next();
        }
        else {
            throw new Error("403/Unauthenticated : work only");
        }
    }
    catch (e) {
        next(e);
    }
});
exports.workerOnly = workerOnly;
const authenticatedWithRefresh = (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token)
        throw new Error("401/Unauthorizaion");
    try {
        const payload = jsonwebtoken_1.default.verify(token, jwtSecretKey);
        req.userId = payload.sub;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.authenticatedWithRefresh = authenticatedWithRefresh;
