"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../app");
const client_1 = __importDefault(require("../db/prisma/client"));
const auth_service_1 = __importStar(require("./auth.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// 내정보 가져오는 함수 : 이름 , 프로필 생성 여부
const getUserMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield client_1.default.user.findFirst({ where: { id: userId } });
        if (!user)
            throw new Error("400/user not found");
        const { id, name, hasProfile, role, hasRequest, email } = user;
        const userData = {
            sub: id,
            email,
            name,
            hasProfile,
            role,
            hasRequest,
        };
        return userData;
    }
    catch (e) {
        throw e;
    }
});
// 내정보 가져오는 함수 : 프로필 이미지 가져오는 함수
const getProfileImage = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 유저인 경우
        const customerProfile = yield client_1.default.customerProfile.findFirst({
            where: { customerId: userId },
        });
        if (customerProfile === null || customerProfile === void 0 ? void 0 : customerProfile.profileImage) {
            return {
                profileImage: `${app_1.BASE_URL}/static/${customerProfile.profileImage
                    .split("/")
                    .pop()}`,
            };
        }
        // 기사인 경우
        const workerProfile = yield client_1.default.workerProfile.findFirst({
            where: { workerId: userId },
        });
        if (workerProfile === null || workerProfile === void 0 ? void 0 : workerProfile.profileImage) {
            return {
                profileImage: `${app_1.BASE_URL}/static/${workerProfile.profileImage
                    .split("/")
                    .pop()}`,
            };
        }
        //프로필 이미지 없음
        return null;
    }
    catch (e) {
        throw e;
    }
});
//유저 정보 업데이트하는 함수
const updateUserInfo = (updateUserDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, password, newPassword, provider = "local" } = updateUserDto, rest = __rest(updateUserDto, ["userId", "password", "newPassword", "provider"]);
        const user = yield client_1.default.user.findFirst({ where: { id: userId } });
        if (!user) {
            throw new Error("400/user not found");
        }
        // 비밀번호 확인하기
        if (provider === "local") {
            yield (0, auth_service_1.checkPassword)(password, user.encryptedPassword);
        }
        // 비밀번호 생성
        if (newPassword) {
            const encryptedPassword = yield bcrypt_1.default.hash(newPassword, 12);
            yield client_1.default.user.update({
                where: { id: userId },
                data: Object.assign(Object.assign({}, rest), { encryptedPassword }),
                include: {
                    workProfile: { select: { profileImage: true } },
                    customerProfile: { select: { profileImage: true } },
                },
            });
        }
        else {
            yield client_1.default.user.update({
                where: { id: userId },
                data: Object.assign({}, rest),
                include: {
                    workProfile: { select: { profileImage: true } },
                    customerProfile: { select: { profileImage: true } },
                },
            });
        }
        return;
    }
    catch (e) {
        throw e;
    }
});
const updateUserRequestStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client_1.default.user.findFirstOrThrow({
            where: { id: userId },
        });
        const user = yield client_1.default.user.update({
            where: { id: userId },
            data: { hasRequest: true },
        });
        return yield auth_service_1.default.createTokenByUserData(user);
    }
    catch (e) {
        throw e;
    }
});
const findUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client_1.default.user.findFirst({
            where: { id: userId },
            select: { id: true },
        });
        if (!userId)
            throw new Error("400/worker not found");
    }
    catch (e) {
        throw e;
    }
});
const getUserInfo = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield client_1.default.user.findFirst({
            where: { id: userId },
            select: { name: true, phoneNumber: true, email: true, provider: true },
        });
        if (!user)
            throw new Error("400/user not found");
        return user;
    }
    catch (e) {
        throw e;
    }
});
const userService = {
    getUserMe,
    getProfileImage,
    updateUserInfo,
    updateUserRequestStatus,
    findUser,
    getUserInfo,
};
exports.default = userService;
