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
const estimate_request_sevice_1 = __importDefault(require("../services/estimate-request.sevice"));
const user_service_1 = __importDefault(require("../services/user.service"));
const profile_service_1 = __importDefault(require("../services/profile.service"));
const favorite_service_1 = __importDefault(require("../services/favorite.service"));
const app_1 = require("../app");
const notification_service_1 = __importDefault(require("../services/notification.service"));
//일반 유저가 지정 견적 생성 (일반 유저가 기사 유저에게 견적 보내기)
const createAssignedEstimateController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { workerId } = req.params;
    if (typeof workerId !== "string")
        throw new Error("400/workerId is invalid");
    const customerId = req.userId;
    // 지정 견적 생성
    const estimateDto = {
        workerId,
        customerId,
        status: "assigned",
    };
    const customer = yield user_service_1.default.getUserMe(customerId);
    const estimate = yield estimate_service_1.default.createEstimate(estimateDto);
    const esitmateMessage = estimate.serviceType === "homeMove"
        ? "가정이사"
        : estimate.serviceType === "officeMove"
            ? "사무실이사"
            : "소형이사";
    yield notification_service_1.default.sendNotification({
        message: `${customer.name} 고객님의 ${esitmateMessage}견적이 도착했어요`,
        userId: workerId,
    });
    res.sendStatus(201);
}));
//일반 유저가 견적 확정하기 가격확인해야함
const confirmEstimateController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { estimateId } = req.params;
    const customerId = req.userId;
    if (typeof estimateId !== "string")
        throw new Error("400/workerId is invalid");
    // isConfirmed ->ture로 변경
    const estimate = yield estimate_service_1.default.confirmEstimate(estimateId);
    // 유저의 견적 요청 상태값 변경경
    yield estimate_request_sevice_1.default.confirmEstimateRequest(customerId);
    const customer = yield user_service_1.default.getUserMe(customerId);
    const worker = yield profile_service_1.default.getnickname(estimate.workerId);
    yield notification_service_1.default.sendNotification({
        message: `${worker.nickname} 기사님의 견적이 확정되었어요`,
        userId: customerId,
    });
    yield notification_service_1.default.sendNotification({
        message: `${customer.name} 고객님의 견적이 확정되었어요`,
        userId: estimate.workerId,
    });
    res.sendStatus(204);
}));
//기사 유저가 견적 생성하기 (기사유저가 일반 유저에게 견적 보내기)
const createGeneralEstimateController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerId } = req.params;
    const { price } = req.body;
    const workerId = req.userId;
    if (typeof customerId !== "string")
        throw new Error("400/workerId is invalid");
    // 일반 견적 생성
    const estimateDto = {
        workerId,
        customerId,
        status: "general",
        price,
    };
    const worker = yield profile_service_1.default.getnickname(workerId);
    const estimate = yield estimate_service_1.default.createEstimate(estimateDto);
    const esitmateMessage = estimate.serviceType === "homeMove"
        ? "가정이사"
        : estimate.serviceType === "officeMove"
            ? "사무실이사"
            : "소형이사";
    yield notification_service_1.default.sendNotification({
        message: `${worker.nickname} 기사님의 ${esitmateMessage} 견적이 도착했어요`,
        userId: customerId,
    });
    res.sendStatus(201);
}));
// 기사 유저가 지정 견적 반려하기
const rejectEstimateController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { estimateId } = req.params;
    const { rejectionMessage } = req.body;
    if (typeof estimateId !== "string")
        throw new Error("400/workerId is invalid");
    yield estimate_service_1.default.rejectEstimate(estimateId, rejectionMessage);
    res.sendStatus(204);
}));
// 기사 유저가 지정 견적에 가격을 업데이트
const priceEstimateController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { estimateId } = req.params;
    const { price, comment } = req.body;
    if (typeof estimateId !== "string")
        throw new Error("400/workerId is invalid");
    yield estimate_service_1.default.priceEstimate(estimateId, price, comment);
    res.sendStatus(204);
}));
//일반 유저 대기중인 견적 get
const getPendingEstimatesController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    const { page, pageSize } = req.validateQuery;
    const { pendingEstimatesWithData, totalCount } = yield estimate_service_1.default.getPendingEstimates({
        customerId,
        page,
        pageSize,
    });
    const list = yield Promise.all(pendingEstimatesWithData.map((estimate) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const { id, price, serviceType, status, movingDate, departure, destination, isConfirmed, worker, } = estimate;
        return {
            id,
            price: price ? price : null,
            serviceType: serviceType,
            status,
            movingDate,
            departure,
            destination,
            isConfirmed,
            profileImage: ((_a = worker.workProfile) === null || _a === void 0 ? void 0 : _a.profileImage)
                ? `${app_1.BASE_URL}/static/${worker.workProfile.profileImage
                    .split("/")
                    .pop()}`
                : null,
            summary: (_b = worker.workProfile) === null || _b === void 0 ? void 0 : _b.summary,
            nickname: (_c = worker.workProfile) === null || _c === void 0 ? void 0 : _c.nickname,
            experience: (_d = worker.workProfile) === null || _d === void 0 ? void 0 : _d.experience,
            confirmedEstimatesCount: worker.confirmedEstimatesCount,
            reviewsCount: (_e = worker._count) === null || _e === void 0 ? void 0 : _e.receivedReviews,
            favoritesCount: (_f = worker._count) === null || _f === void 0 ? void 0 : _f.workerFavorites,
            rating: worker.avgStar,
            isFavorite: !!((_g = worker.workerFavorites) === null || _g === void 0 ? void 0 : _g.length),
        };
    })));
    res.status(200).send({ list, totalCount });
}));
//일반 유저 견적 컨트롤러 (받았던 견적 조회할때)
const getEstimatesController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { estimateRequestId } = req.params;
    const customerId = req.userId;
    const { page, pageSize } = req.validateQuery;
    const { estimatesWithData, totalCount } = yield estimate_service_1.default.getEstimatesByEstimateRequestId({
        estimateRequestId,
        page,
        pageSize,
        customerId,
    });
    const list = yield Promise.all(estimatesWithData.map((estimate) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const { id, price, serviceType, status, movingDate, departure, destination, isConfirmed, worker, } = estimate;
        return {
            id,
            price: price ? price : null,
            serviceType: serviceType,
            status,
            movingDate,
            departure,
            destination,
            isConfirmed,
            profileImage: ((_a = worker.workProfile) === null || _a === void 0 ? void 0 : _a.profileImage)
                ? `${app_1.BASE_URL}/static/${worker.workProfile.profileImage
                    .split("/")
                    .pop()}`
                : null,
            summary: (_b = worker.workProfile) === null || _b === void 0 ? void 0 : _b.summary,
            nickname: (_c = worker.workProfile) === null || _c === void 0 ? void 0 : _c.nickname,
            experience: (_d = worker.workProfile) === null || _d === void 0 ? void 0 : _d.experience,
            confirmedEstimatesCount: worker.confirmedEstimatesCount,
            reviewsCount: (_e = worker._count) === null || _e === void 0 ? void 0 : _e.receivedReviews,
            favoritesCount: (_f = worker._count) === null || _f === void 0 ? void 0 : _f.workerFavorites,
            rating: worker.avgStar,
            isFavorite: !!((_g = worker.workerFavorites) === null || _g === void 0 ? void 0 : _g.length),
        };
    })));
    res.status(200).send({ list, totalCount });
}));
//상세 견적 by worker
const getEstimateDetailByWorkerController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { estimateId } = req.params;
    const estimate = yield estimate_service_1.default.getEstimateByEstimatetId(estimateId);
    const { id, price, serviceType, status, movingDate, departure, destination, isConfirmed, customerId, createdAt, } = estimate;
    const { name } = yield user_service_1.default.getUserMe(customerId);
    const data = {
        id,
        price: price ? price : null,
        serviceType: serviceType,
        status,
        movingDate,
        departure,
        destination,
        isConfirmed,
        customerId,
        customerName: name,
        requestDate: createdAt,
    };
    res.status(200).send(data);
}));
//상세 견적 by customer
const getEstimateDetailByCustomerController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { estimateId } = req.params;
    const customerId = req.userId;
    const estimate = yield estimate_service_1.default.getEstimateByEstimatetId(estimateId);
    const { id, price, serviceType, status, movingDate, departure, destination, isConfirmed, workerId, createdAt, } = estimate;
    const isFavorite = yield favorite_service_1.default.checkFavorite({
        customerId,
        workerId,
    });
    const { nickname, profileImage, experience, confirmedEstimatesCount, favoritesCount, reviewsAverage, reviewsCount, } = yield profile_service_1.default.getWorkerProfile(workerId);
    const data = {
        id,
        price: price ? price : null,
        serviceType: serviceType,
        status,
        movingDate,
        departure,
        destination,
        isConfirmed,
        workerId,
        nickname: nickname,
        profileImage: profileImage
            ? `${app_1.BASE_URL}/static/${profileImage.split("/").pop()}`
            : null,
        experience: experience,
        confirmedEstimatesCount: confirmedEstimatesCount,
        favoritesCount: favoritesCount,
        rating: reviewsAverage,
        reviewsCount: reviewsCount,
        isFavorite,
        requestDate: createdAt,
    };
    res.status(200).send(data);
}));
const getSentEstimatesController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = req.userId;
    const { page, pageSize } = req.validateQuery;
    const { estimates, totalCount } = yield estimate_service_1.default.getSentEstimates({
        workerId,
        page,
        pageSize,
    });
    const list = yield Promise.all(estimates.map((_a) => __awaiter(void 0, [_a], void 0, function* ({ id, customerId, serviceType, movingDate, departure, destination, createdAt, updatedAt, status, customer, price, }) {
        return {
            id,
            customerId,
            serviceType,
            movingDate,
            departure,
            destination,
            createdAt,
            updatedAt,
            status,
            customerName: customer === null || customer === void 0 ? void 0 : customer.name,
            price,
        };
    })));
    res.status(200).send({ list, totalCount });
}));
const getRejectEstimatesController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = req.userId;
    const { page, pageSize } = req.validateQuery;
    const { estimates, totalCount } = yield estimate_service_1.default.getRejectEstimates({
        workerId,
        page,
        pageSize,
    });
    const list = yield Promise.all(estimates.map((_a) => __awaiter(void 0, [_a], void 0, function* ({ id, customerId, serviceType, movingDate, departure, destination, createdAt, updatedAt, status, customer, }) {
        return {
            id,
            customerId,
            serviceType,
            movingDate,
            departure,
            destination,
            createdAt,
            updatedAt,
            status,
            customerName: customer === null || customer === void 0 ? void 0 : customer.name,
        };
    })));
    res.status(200).send({ list, totalCount });
}));
const getReviewableEstimatesController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    const { page, pageSize } = req.validateQuery;
    const { estimates, totalCount } = yield estimate_service_1.default.getReviewableEstimates({
        customerId,
        page,
        pageSize,
    });
    const list = estimates.map((estimate) => {
        var _a, _b;
        return ({
            id: estimate.id,
            workerId: estimate.workerId,
            serviceType: estimate.serviceType,
            movingDate: estimate.movingDate,
            departure: estimate.departure,
            destination: estimate.destination,
            price: estimate.price,
            status: estimate.status,
            nickname: (_b = (_a = estimate.worker) === null || _a === void 0 ? void 0 : _a.workProfile) === null || _b === void 0 ? void 0 : _b.nickname,
        });
    });
    res.send({ list, totalCount }).status(200);
}));
const estimate = {
    createAssignedEstimateController,
    confirmEstimateController,
    createGeneralEstimateController,
    rejectEstimateController,
    priceEstimateController,
    getPendingEstimatesController,
    getEstimatesController,
    getEstimateDetailByWorkerController,
    getSentEstimatesController,
    getRejectEstimatesController,
    getReviewableEstimatesController,
    getEstimateDetailByCustomerController,
};
exports.default = estimate;
