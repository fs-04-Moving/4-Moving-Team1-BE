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
const createReview = (reviewDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { estimateId } = reviewDto;
        const existReview = yield client_1.default.review.findFirst({
            where: { estimateId },
        });
        if (existReview)
            throw new Error("400/Review already exist");
        yield client_1.default.review.create({
            data: reviewDto,
        });
    }
    catch (e) {
        throw e;
    }
});
const getMyReview = (_a) => __awaiter(void 0, [_a], void 0, function* ({ customerId, page, pageSize, }) {
    try {
        const [reviews, totalCount] = yield Promise.all([
            client_1.default.review.findMany({
                where: { customerId },
                include: {
                    estimate: {
                        select: {
                            serviceType: true,
                            movingDate: true,
                            price: true,
                            status: true,
                            worker: {
                                select: {
                                    workProfile: {
                                        select: {
                                            nickname: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client_1.default.review.count({ where: { customerId } }),
        ]);
        return { reviews, totalCount };
    }
    catch (e) {
        throw e;
    }
});
const getWorkerReviews = (_a) => __awaiter(void 0, [_a], void 0, function* ({ page, pageSize, workerId, }) {
    const [reviews, group, avgStar] = yield Promise.all([
        client_1.default.review.findMany({
            where: { workerId },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        client_1.default.review.groupBy({
            by: ["star"],
            where: { workerId },
            _count: true,
        }),
        client_1.default.review.aggregate({
            where: { workerId },
            _avg: { star: true },
        }),
    ]);
    const starCountList = [0, 0, 0, 0, 0];
    group.forEach((item) => {
        const star = item.star;
        starCountList[star - 1] = item._count;
    });
    const totalCount = starCountList.reduce((a, b) => {
        return a + b;
    }, 0);
    return {
        list: reviews,
        starCountList,
        totalCount,
        rating: avgStar._avg.star,
    };
});
const reviewService = { createReview, getMyReview, getWorkerReviews };
exports.default = reviewService;
