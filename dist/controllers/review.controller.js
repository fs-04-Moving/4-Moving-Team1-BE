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
const estimate_service_1 = __importDefault(require("../services/estimate.service"));
const review_serivce_1 = __importDefault(require("../services/review.serivce"));
const createReviewController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { estimateId } = req.params;
    const customerId = req.userId;
    const { content, star } = req.body;
    const workerId = yield estimate_service_1.default.getworkerIdByEstimateId(estimateId);
    const reviewDto = {
        content,
        star,
        estimateId,
        workerId,
        customerId,
    };
    yield review_serivce_1.default.createReview(reviewDto);
    res.sendStatus(201);
}));
const getMyReviewController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    const { page, pageSize } = req.validateQuery;
    const { reviews, totalCount } = yield review_serivce_1.default.getMyReview({
        customerId,
        page,
        pageSize,
    });
    const list = reviews.map((review) => {
        var _a, _b, _c, _d, _e, _f, _g;
        return ({
            id: review.id,
            workerId: review.workerId,
            customerId: review.customerId,
            star: review.star,
            createdAt: review.createdAt,
            content: review.content,
            estimateId: review.estimateId,
            serviceType: (_a = review.estimate) === null || _a === void 0 ? void 0 : _a.serviceType,
            movingDate: (_b = review.estimate) === null || _b === void 0 ? void 0 : _b.movingDate,
            price: (_c = review.estimate) === null || _c === void 0 ? void 0 : _c.price,
            status: (_d = review.estimate) === null || _d === void 0 ? void 0 : _d.status,
            workerNickname: (_g = (_f = (_e = review.estimate) === null || _e === void 0 ? void 0 : _e.worker) === null || _f === void 0 ? void 0 : _f.workProfile) === null || _g === void 0 ? void 0 : _g.nickname,
        });
    });
    res.status(200).send({ list, totalCount });
}));
const getWorkerReviewsController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { workerId } = req.params;
    const { page, pageSize } = req.validateQuery;
    const result = yield review_serivce_1.default.getWorkerReviews({
        workerId,
        page,
        pageSize,
    });
    res.send(result).status(200);
}));
const review = {
    createReviewController,
    getMyReviewController,
    getWorkerReviewsController,
};
exports.default = review;
