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
const client_1 = __importDefault(require("../db/prisma/client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtSecretKey = process.env.JWT_SECRET_KEY;
if (!jwtSecretKey) {
    throw new Error("jwtSerectKey is not exist");
}
const createToken = (data) => {
    try {
        const payload = {
            sub: data.id,
            email: data.email,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, jwtSecretKey, {
            expiresIn: "2h",
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, jwtSecretKey, {
            expiresIn: "5d",
        });
        return { accessToken, refreshToken };
    }
    catch (e) {
        if (e instanceof Error) {
            throw e;
        }
        throw new Error(String(e));
    }
};
const logIn = (logInDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const { email, password } = logInDto;
            const user = yield prisma.user.findFirstOrThrow({
                where: { email },
            });
            const checkPassword = yield bcrypt_1.default.compare(password, user.encryptedPassword);
            if (!checkPassword) {
                throw new Error("400/Incorrect password");
            }
            const data = {
                id: user.id,
                email: user.email,
                name: user.name,
            };
            const { accessToken, refreshToken } = createToken(data);
            const { sub } = jsonwebtoken_1.default.verify(accessToken, jwtSecretKey);
            if (typeof sub !== "string") {
                throw new Error("sub is not string");
            }
            return {
                sub,
                accessToken,
                refreshToken,
            };
        }));
        return result;
    }
    catch (e) {
        throw new Error(String(e));
    }
});
const signUp = (signUpDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, phoneNumber } = signUpDto;
        const encryptedPassword = yield bcrypt_1.default.hash(password, 12);
        const result = yield client_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const isExistingEmail = yield prisma.user.findUnique({
                where: { email },
            });
            if (isExistingEmail)
                throw new Error("400/이미 존재하는 이메일입니다.");
            const newUser = yield prisma.user.create({
                data: { email, name, encryptedPassword, phoneNumber },
            });
            const data = {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            };
            const { accessToken, refreshToken } = createToken(data);
            const { sub } = jsonwebtoken_1.default.verify(accessToken, jwtSecretKey);
            if (typeof sub !== "string") {
                throw new Error("sub is not string");
            }
            return { sub, accessToken, refreshToken };
        }));
        return result;
    }
    catch (e) {
        throw new Error(String(e));
    }
});
const authService = { logIn, signUp };
exports.default = authService;
