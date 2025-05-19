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
const createFavorite = (customerId, workerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const worker = yield client_1.default.user.findFirst({
            where: { id: workerId },
            select: { id: true },
        });
        if (!worker)
            throw new Error("400/invalid worker id");
        const customer = yield client_1.default.user.findFirst({
            where: { id: workerId },
            select: { id: true },
        });
        if (!customer)
            throw new Error("400/invalid customer id");
        const existFavorite = yield client_1.default.favorite.findFirst({
            where: { customerId, workerId },
        });
        if (existFavorite) {
            throw new Error("400/favorite already exist");
        }
        yield client_1.default.favorite.create({
            data: { workerId, customerId },
        });
    }
    catch (e) {
        throw e;
    }
});
const deleteFavorite = (customerId, workerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const worker = yield client_1.default.user.findFirst({
            where: { id: workerId },
            select: { id: true },
        });
        if (!worker)
            throw new Error("400/invalid worker id");
        const customer = yield client_1.default.user.findFirst({
            where: { id: workerId },
            select: { id: true },
        });
        if (!customer)
            throw new Error("400/invalid customer id");
        const existFavorite = yield client_1.default.favorite.findFirst({
            where: { customerId, workerId },
        });
        if (!existFavorite) {
            throw new Error("400/favorite not exist");
        }
        yield client_1.default.favorite.delete({
            where: { customerId_workerId: { customerId, workerId } },
        });
    }
    catch (e) {
        throw e;
    }
});
const getFavoriteWorkers = (_a) => __awaiter(void 0, [_a], void 0, function* ({ customerId, page, pageSize, }) {
    try {
        const now = new Date();
        const [favoriteWorkers, totalCount] = yield Promise.all([
            client_1.default.favorite.findMany({
                where: { customerId },
                include: {
                    worker: {
                        select: {
                            id: true,
                            workProfile: true,
                            _count: {
                                select: {
                                    receivedReviews: true,
                                    workerFavorites: true,
                                },
                            },
                        },
                    },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client_1.default.favorite.count({
                where: { customerId },
            }),
        ]);
        const workerIds = favoriteWorkers.map((fav) => fav.worker.id);
        const [avgStars, confirmedEstimatesCounts] = yield Promise.all([
            client_1.default.review.groupBy({
                by: ["workerId"],
                where: { workerId: { in: workerIds } },
                _avg: { star: true },
            }),
            client_1.default.estimate.groupBy({
                by: ["workerId"],
                where: {
                    workerId: { in: workerIds },
                    isConfirmed: true,
                    movingDate: { lt: now },
                },
                _count: { _all: true },
            }),
        ]);
        const favoriteWorkersWithData = favoriteWorkers.map((fav) => {
            var _a, _b;
            const workerId = fav.worker.id;
            const avgStar = ((_a = avgStars.find((review) => review.workerId === workerId)) === null || _a === void 0 ? void 0 : _a._avg.star) ||
                null;
            const confirmedEstimatesCount = ((_b = confirmedEstimatesCounts.find((estimate) => estimate.workerId === workerId)) === null || _b === void 0 ? void 0 : _b._count._all) || 0;
            return Object.assign(Object.assign({}, fav), { worker: Object.assign(Object.assign({}, fav.worker), { avgStar,
                    confirmedEstimatesCount }) });
        });
        return { favoriteWorkersWithData, totalCount };
    }
    catch (e) {
        throw e;
    }
});
const checkFavorite = (_a) => __awaiter(void 0, [_a], void 0, function* ({ customerId, workerId, }) {
    try {
        if (!customerId)
            return false;
        const existFavorite = yield client_1.default.favorite.findFirst({
            where: { customerId, workerId },
        });
        return !!existFavorite;
    }
    catch (e) {
        throw e;
    }
});
const favoriteService = {
    createFavorite,
    deleteFavorite,
    getFavoriteWorkers,
    checkFavorite,
};
exports.default = favoriteService;
