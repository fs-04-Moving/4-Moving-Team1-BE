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
const error_middleware_1 = require("../middlewear/error.middleware");
const auth_service_1 = __importDefault(require("../servieces/auth.service"));
const logInController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const logInDto = { email, password };
    const { sub, accessToken, refreshToken } = yield auth_service_1.default.logIn(logInDto);
    req.userId = sub;
    res.status(200).send({ accessToken, refreshToken });
}));
const signUpController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, phoneNumber } = req.body;
    const signUpDto = { email, password, name, phoneNumber };
    const { sub, accessToken, refreshToken } = yield auth_service_1.default.signUp(signUpDto);
    req.userId = sub;
    res.status(200).send({ accessToken, refreshToken });
}));
const auth = { logInController, signUpController };
exports.default = auth;
