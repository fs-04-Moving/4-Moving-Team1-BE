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
const error_middleware_1 = require("../middleware/error.middleware");
const auth_service_1 = __importDefault(require("../services/auth.service"));
// 로그인 컨트롤러
const logInController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = req.body;
    const logInDto = { email, password, role };
    try {
        const { sub, accessToken, refreshToken } = yield auth_service_1.default.logIn(logInDto);
        req.userId = sub;
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // prod에서는 true로 변경
            sameSite: "strict",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        });
        // sameSite:none secure:ture
        // 백엔드랑 프론트엔드 ip
        // secure:ture -> https // http
        // 백엔드 도메인입히고 SSL 인증서 받아서
        //
        res.status(200).send({ accessToken });
    }
    catch (e) {
        // 소셜 가입자 충돌 처리
        if (typeof e === "object" && e && "errorCode" in e) {
            const { errorCode, data } = e;
            res.status(400).json(Object.assign({ errorCode }, data));
        }
        // 일반 에러는 에러 미들웨어로
        throw e;
    }
}));
// 회원가입 컨트롤러
const signUpController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, phoneNumber, role } = req.body;
    const signUpDto = { email, password, name, phoneNumber, role };
    try {
        const result = yield auth_service_1.default.signUp(signUpDto);
        res.status(200).send({ result });
    }
    catch (e) {
        if (typeof e === "object" && e && "errorCode" in e) {
            const { errorCode, data } = e;
            res.status(400).json(Object.assign({ errorCode }, data));
        }
        throw e;
    }
}));
// 리프레쉬 토큰 컨트롤러
const refreshTokenController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        throw new Error("401/No refresh token");
    const { accessToken } = yield auth_service_1.default.refreshToken(refreshToken);
    res.status(200).send({ accessToken });
}));
const logOutController = (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
    });
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
    });
    res.status(200).send({ message: "로그아웃 완료" });
};
const auth = {
    logInController,
    signUpController,
    refreshTokenController,
    logOutController,
};
exports.default = auth;
