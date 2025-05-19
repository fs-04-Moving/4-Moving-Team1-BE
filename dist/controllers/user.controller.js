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
const user_service_1 = __importDefault(require("../services/user.service"));
// 내정보 가저오기 : 이름 프로필 이미지 , 프로필 생성 여부
const getUserMeController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.userId;
    const userData = yield user_service_1.default.getUserMe(userId);
    const profileImage = yield user_service_1.default.getProfileImage(userId);
    res
        .status(200)
        .send(Object.assign(Object.assign({}, userData), { profileImage: (_a = profileImage === null || profileImage === void 0 ? void 0 : profileImage.profileImage) !== null && _a !== void 0 ? _a : null }));
}));
// 유저 정보 업데이트 : 이름 , 이메일 , 전화번호, 비밀번호
const updateUserMeController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { email, password, newPassword, name, phoneNumber, provider } = req.body;
    const updateUserDto = {
        userId,
        email,
        password,
        newPassword,
        name,
        phoneNumber,
        provider,
    };
    yield user_service_1.default.updateUserInfo(updateUserDto);
    res.sendStatus(204);
}));
const getUserInfoController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const userInfo = yield user_service_1.default.getUserInfo(userId);
    res.status(200).send(userInfo);
}));
const user = {
    getUserMeController,
    updateUserMeController,
    getUserInfoController,
};
exports.default = user;
