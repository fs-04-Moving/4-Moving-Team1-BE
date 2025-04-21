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
exports.checkPassword = exports.createToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../app");
const client_1 = __importDefault(require("../db/prisma/client"));
const jwtSecretKey = process.env.JWT_SECRET_KEY;
if (!jwtSecretKey) {
    throw new Error("jwtSerectKey is not exist");
}
// 토큰 생성 함수
const createToken = (data) => {
    try {
        const payload = Object.assign({ sub: data.id, email: data.email, role: data.role, hasProfile: data.hasProfile, name: data.name }, (data.profileImage && {
            profileImage: `${app_1.BASE_URL}/static/${data.profileImage
                .split("/")
                .pop()}`,
        }));
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
        throw e;
    }
};
exports.createToken = createToken;
// 비밀번호가 암호화된(DB에 저장된) 비밀번호와 같은지 확인하는 함수
const checkPassword = (password, encryptedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkPassword = yield bcrypt_1.default.compare(password, encryptedPassword);
        if (!checkPassword) {
            throw new Error("400/Incorrect password");
        }
    }
    catch (e) {
        throw e;
    }
});
exports.checkPassword = checkPassword;
// 로그인 함수
const logIn = (logInDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const { email, password, role } = logInDto;
            const user = yield prisma.user.findUnique({
                where: { email, role },
                include: {
                    customerProfile: true,
                    workProfile: true,
                },
            });
            if (!user)
                throw new Error("400/유저가 존재하지 않습니다.");
            const profileImage = (_b = (_a = user.customerProfile) === null || _a === void 0 ? void 0 : _a.profileImage) !== null && _b !== void 0 ? _b : (_c = user.workProfile) === null || _c === void 0 ? void 0 : _c.profileImage;
            yield (0, exports.checkPassword)(password, user.encryptedPassword);
            const data = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                hasProfile: user.hasProfile,
                profileImage: profileImage
                    ? `${app_1.BASE_URL}/static/${profileImage.split("/").pop()}`
                    : undefined, // 추가(조형민)
            };
            const { accessToken, refreshToken } = (0, exports.createToken)(data);
            const { sub } = jsonwebtoken_1.default.verify(accessToken, jwtSecretKey);
            if (typeof sub !== "string") {
                throw new Error("400/sub is not string");
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
        throw e;
    }
});
// 회원가입 함수
const signUp = (signUpDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, phoneNumber, role } = signUpDto;
        const encryptedPassword = yield bcrypt_1.default.hash(password, 12);
        const result = yield client_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const isExistingEmail = yield prisma.user.findUnique({
                where: { email },
            });
            if (isExistingEmail)
                throw new Error("400/이미 존재하는 이메일입니다.");
            const newUser = yield prisma.user.create({
                data: { email, name, encryptedPassword, phoneNumber, role },
            });
            return { id: newUser.id, email: newUser.email };
        }));
        return result;
    }
    catch (e) {
        throw e;
    }
});
// 리프레쉬 토큰 함수
const refreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const { sub, email, name, hasProfile, role, profileImage } = jsonwebtoken_1.default.verify(refreshToken, jwtSecretKey);
    if (typeof sub !== "string") {
        throw new Error("400/sub is not string");
    }
    const data = {
        id: sub,
        email,
        name,
        hasProfile,
        role,
        profileImage: typeof profileImage === "string"
            ? `${app_1.BASE_URL}/static/${profileImage.split("/").pop()}`
            : undefined,
    };
    const { accessToken } = (0, exports.createToken)(data);
    return { accessToken };
});
// 토큰 업데이트
const createTokenByUserData = (user) => {
    var _a, _b;
    const profileImage = user.role === "customer"
        ? typeof ((_a = user.customerProfile) === null || _a === void 0 ? void 0 : _a.profileImage) === "string"
            ? `${app_1.BASE_URL}/static/${user.customerProfile.profileImage
                .split("/")
                .pop()}`
            : undefined
        : user.role === "worker"
            ? typeof ((_b = user.workProfile) === null || _b === void 0 ? void 0 : _b.profileImage) === "string"
                ? `${app_1.BASE_URL}/static/${user.workProfile.profileImage.split("/").pop()}`
                : undefined
            : undefined;
    const data = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasProfile: user.hasProfile,
        profileImage,
    };
    const { accessToken, refreshToken } = (0, exports.createToken)(data);
    return { accessToken, refreshToken };
};
const authService = { logIn, signUp, refreshToken, createTokenByUserData };
exports.default = authService;
