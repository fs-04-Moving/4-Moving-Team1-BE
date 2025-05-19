"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../../controllers/auth.controller"));
const google_controller_1 = __importDefault(require("../../controllers/google.controller"));
const kakao_controller_1 = __importDefault(require("../../controllers/kakao.controller"));
const naver_controller_1 = __importDefault(require("../../controllers/naver.controller"));
const auth_validation_1 = require("../../validations/auth.validation");
const authRouter = express_1.default.Router();
authRouter.post('/log-in', auth_validation_1.validateSignIn, auth_controller_1.default.logInController);
authRouter.post('/sign-up', auth_validation_1.validateSignUp, auth_controller_1.default.signUpController);
authRouter.post('/refresh-token', auth_controller_1.default.refreshTokenController);
authRouter.delete('/log-out', auth_controller_1.default.logOutController);
// 구글 로그인용 라우트 추가(조형민)
authRouter.get('/google', google_controller_1.default.googleLoginRedirect);
authRouter.get('/google/callback', google_controller_1.default.googleCallback);
// 카카오 로그인용 라우트 추가(조형민)
authRouter.get('/kakao', kakao_controller_1.default.kakaoLoginRedirect);
authRouter.get('/kakao/callback', kakao_controller_1.default.kakaoCallback);
// 네이버 로그인용 라우트 추가(조형민)
authRouter.get('/naver', naver_controller_1.default.naverLoginRedirect);
authRouter.get('/naver/callback', naver_controller_1.default.naverCallback);
exports.default = authRouter;
