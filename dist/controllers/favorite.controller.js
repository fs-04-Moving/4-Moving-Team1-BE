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
const favorite_service_1 = __importDefault(require("../services/favorite.service"));
const app_1 = require("../app");
const user_service_1 = __importDefault(require("../services/user.service"));
const createFavoriteController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    const { workerId } = req.params;
    yield favorite_service_1.default.createFavorite(customerId, workerId);
    res.sendStatus(201);
}));
const deleteFavoriteController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    const { workerId } = req.params;
    yield favorite_service_1.default.deleteFavorite(customerId, workerId);
    res.sendStatus(204);
}));
const getFavoriteWorkersController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    const { page, pageSize } = req.validateQuery;
    const { favoriteWorkersWithData, totalCount } = yield favorite_service_1.default.getFavoriteWorkers({
        customerId,
        page,
        pageSize,
    });
    const list = favoriteWorkersWithData
        .filter((fav) => { var _a; return (_a = fav.worker) === null || _a === void 0 ? void 0 : _a.workProfile; })
        .map((fav) => {
        const profile = fav.worker.workProfile;
        return {
            id: fav.workerId,
            profileImage: profile.profileImage
                ? `${app_1.BASE_URL}/static/${profile.profileImage.split("/").pop()}`
                : null,
            nickname: profile.nickname,
            experience: profile.experience,
            summary: profile.summary,
            description: profile.description,
            services: profile.services,
            serviceAreas: profile.serviceAreas,
            confirmedEstimatesCount: fav.worker.confirmedEstimatesCount || 0,
            reviewsCount: fav.worker._count.receivedReviews || 0,
            favoritesCount: fav.worker._count.workerFavorites || 0,
            reviewsAverage: fav.worker.avgStar || 0,
            isFavorite: true,
        };
    });
    res.send({ list, totalCount }).status(200);
}));
const checkFavoriteController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    const { workerId } = req.params;
    yield user_service_1.default.findUser(workerId);
    const result = yield favorite_service_1.default.checkFavorite({
        customerId,
        workerId,
    });
    res.status(200).send(result);
}));
const favorite = {
    createFavoriteController,
    deleteFavoriteController,
    getFavoriteWorkersController,
    checkFavoriteController,
};
exports.default = favorite;
