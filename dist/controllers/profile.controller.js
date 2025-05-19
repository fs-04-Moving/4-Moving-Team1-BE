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
const app_1 = require("../app");
const error_middleware_1 = require("../middleware/error.middleware");
const favorite_service_1 = __importDefault(require("../services/favorite.service"));
const profile_service_1 = __importDefault(require("../services/profile.service"));
// 일반 유저 프로필 생성
const createCustomerProfileController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { livingArea, services } = req.body;
    let profileImage = null;
    if (req.file) {
        profileImage = req.file.path;
    }
    const customerId = req.userId;
    if (!customerId)
        return;
    const customerProfileDto = {
        profileImage,
        livingArea,
        services,
        customerId,
    };
    yield profile_service_1.default.createCustomerProfile(customerProfileDto); //유저 프로필 생성
    const { accessToken, refreshToken } = yield profile_service_1.default.updateUserProfileStatus(customerId); // 유저 프로필 상태 업데이트 (hasProfile :true)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
    });
    res.status(200).send({ accessToken });
}));
// 기사 유저 프로필 생성
const createWorkerProfileController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { nickname, experience, summary, description, services, serviceAreas, } = req.body;
    let profileImage = null;
    if (req.file) {
        profileImage = req.file.path;
    }
    const workerId = req.userId;
    if (!workerId)
        return;
    const workerProfileDto = {
        profileImage,
        nickname,
        experience,
        summary,
        description,
        serviceAreas,
        services,
        workerId,
    };
    yield profile_service_1.default.createWorkerProfile(workerProfileDto); //유저 프로필 생성
    const { accessToken, refreshToken } = yield profile_service_1.default.updateUserProfileStatus(workerId); // 유저 프로필 상태 업데이트 (hasProfile :true)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
    });
    res.status(200).send({ accessToken });
}));
// 일반 유저 프로필 수정
const updateCustomerProfileController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { livingArea, services } = req.body;
    let profileImage;
    if (req.file) {
        profileImage = req.file.path;
    }
    const customerId = req.userId;
    if (!customerId)
        return;
    const customerProfileDto = {
        profileImage,
        livingArea,
        services,
        customerId,
    };
    yield profile_service_1.default.updateCustomerProfile(customerProfileDto); //유저 프로필 수정
    const { accessToken, refreshToken } = yield profile_service_1.default.updateUserProfileStatus(customerId); // 프로필 상태 업데이트 + 토큰 재발급
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
    });
    res.sendStatus(204);
}));
// 기사 유저 프로필 수정
const updateWorkerProfileController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { nickname, experience, summary, description, services, serviceAreas, } = req.body;
    let profileImage;
    if (req.file) {
        profileImage = req.file.path;
    }
    const workerId = req.userId;
    if (!workerId)
        return;
    const workerProfileDto = {
        profileImage,
        nickname,
        experience,
        summary,
        description,
        serviceAreas,
        services,
        workerId,
    };
    yield profile_service_1.default.updateWorkerProfile(workerProfileDto); //유저 프로필 생성
    const { accessToken, refreshToken } = yield profile_service_1.default.updateUserProfileStatus(workerId); // 유저 프로필 상태 업데이트 (hasProfile :true)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
    });
    res.sendStatus(204);
}));
// 기사님 프로필 정보 가져오기
const getWorkerProfileController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { workerId } = req.params;
    const customerId = req.userId;
    const workerProfile = yield profile_service_1.default.getWorkerProfile(workerId);
    const isFavorite = yield favorite_service_1.default.checkFavorite({
        customerId,
        workerId,
    });
    res.status(200).send(Object.assign(Object.assign({}, workerProfile), { isFavorite }));
}));
const getWorkerProfilesController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderBy, serviceType, serviceArea, page, pageSize, search } = req.validateQuery;
    const customerId = req.userId;
    const workerProfiles = yield profile_service_1.default.getWorkerProfiles({
        orderBy,
        serviceType,
        serviceArea,
        page,
        pageSize,
        search,
        customerId,
    });
    res.status(200).send(workerProfiles);
}));
const getWorkerProfileMeController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = req.userId;
    const result = yield profile_service_1.default.getWorkerProfileMe(workerId);
    const formattedResult = Object.assign(Object.assign({}, result), { profileImage: result.profileImage
            ? `${app_1.BASE_URL}/static/${result.profileImage.split("/").pop()}`
            : null });
    res.status(200).send(formattedResult);
}));
const getCustomerProfileMeController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    const result = yield profile_service_1.default.getCustomerProfileMe(customerId);
    const formattedResult = Object.assign(Object.assign({}, result), { profileImage: result.profileImage
            ? `${app_1.BASE_URL}/static/${result.profileImage.split("/").pop()}`
            : null });
    res.status(200).send(formattedResult);
}));
const profile = {
    createWorkerProfileController,
    createCustomerProfileController,
    updateCustomerProfileController,
    updateWorkerProfileController,
    getWorkerProfileController,
    getWorkerProfilesController,
    getWorkerProfileMeController,
    getCustomerProfileMeController,
};
exports.default = profile;
