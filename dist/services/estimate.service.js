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
const estimate_request_sevice_1 = __importDefault(require("./estimate-request.sevice"));
const user_service_1 = __importDefault(require("./user.service"));
// 견적 생성 함수
const createEstimate = (estimateDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId, customerId, status, price } = estimateDto;
        const estimateRequest = yield estimate_request_sevice_1.default.findActiveEstimateRequest(customerId);
        yield user_service_1.default.findUser(workerId);
        const { id, serviceType, departureAddress, destination, movingDate, departureArea, } = estimateRequest;
        const estimate = yield client_1.default.estimate.findFirst({
            where: { customerId, workerId },
        });
        if (estimate)
            throw new Error("400/estimate already exist");
        if (status === "general" && price === undefined) {
            throw new Error("400/price is required for general estimate");
        }
        const newEstimate = yield client_1.default.estimate.create({
            data: Object.assign({ estimateRequestId: id, customerId,
                workerId,
                serviceType,
                departureAddress,
                destination,
                movingDate,
                status,
                departureArea }, (status === "general" ? { price } : {})),
        });
        return newEstimate;
    }
    catch (e) {
        throw e;
    }
});
// 견적의 isConfirmed: ture로 변경, 만약 가격이 없으면 에러 반환
const confirmEstimate = (estimateId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { price } = yield findEstimate(estimateId);
        if (!price)
            throw new Error("400/The estimate is not yet priced");
        const estimate = yield client_1.default.estimate.update({
            where: { id: estimateId },
            data: { isConfirmed: true },
            select: { workerId: true },
        });
        return estimate;
    }
    catch (e) {
        throw e;
    }
});
//
const rejectEstimate = (estimateId, rejectionMessage) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 견적이 있는지 확인
        const { price } = yield findEstimate(estimateId, "assigned");
        if (price)
            throw new Error("400/estimate already sent to the user.");
        yield client_1.default.estimate.update({
            where: { id: estimateId },
            data: { status: "rejected", rejectionMessage },
        });
    }
    catch (e) {
        throw e;
    }
});
//
const priceEstimate = (estimateId, price, comment) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 견적이 있는지 확인(거부된거면 가격 못하게)
        if (!price)
            throw new Error("400/price is required for general estimate");
        const { price: checkPrice } = yield findEstimate(estimateId, "assigned");
        if (checkPrice)
            throw new Error("400/estimate already sent to the user.");
        yield client_1.default.estimate.update({
            where: { id: estimateId },
            data: { price, comment },
        });
    }
    catch (e) {
        throw e;
    }
});
//pending 상태의 견적들 찾기기
const getPendingEstimates = (_a) => __awaiter(void 0, [_a], void 0, function* ({ customerId, page, pageSize, }) {
    const now = new Date();
    try {
        // 아이디 찾기
        const { id: estimateRequestId } = yield estimate_request_sevice_1.default.findActiveEstimateRequest(customerId);
        const [pendingEstimates, totalCount] = yield Promise.all([
            client_1.default.estimate.findMany({
                where: { estimateRequestId },
                include: {
                    worker: {
                        include: {
                            workProfile: true,
                            _count: {
                                select: {
                                    receivedReviews: true,
                                    workerFavorites: true,
                                },
                            },
                            workerFavorites: { where: { customerId } },
                        },
                    },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client_1.default.estimate.count({
                where: { estimateRequestId },
            }),
        ]);
        const workerIds = pendingEstimates.map((estimate) => estimate.workerId);
        const [avgStars, confirmedEstimateCounts] = yield Promise.all([
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
        const pendingEstimatesWithData = pendingEstimates.map((estimate) => {
            var _a, _b;
            const workerId = estimate.workerId;
            const avgStar = ((_a = avgStars.find((review) => review.workerId === workerId)) === null || _a === void 0 ? void 0 : _a._avg.star) ||
                null;
            const confirmedEstimateCount = ((_b = confirmedEstimateCounts.find((estimate) => estimate.workerId === workerId)) === null || _b === void 0 ? void 0 : _b._count._all) || 0;
            return Object.assign(Object.assign({}, estimate), { worker: Object.assign(Object.assign({}, estimate.worker), { avgStar,
                    confirmedEstimateCount }) });
        });
        return { pendingEstimatesWithData, totalCount };
    }
    catch (e) {
        throw e;
    }
});
//estimateRequestId에 해당하는 견적들 찾기
const getEstimatesByEstimateRequestId = (_a) => __awaiter(void 0, [_a], void 0, function* ({ estimateRequestId, page, pageSize, customerId, }) {
    const now = new Date();
    try {
        const [estimates, totalCount] = yield Promise.all([
            client_1.default.estimate.findMany({
                where: { estimateRequestId },
                include: {
                    worker: {
                        include: {
                            workProfile: true,
                            _count: {
                                select: {
                                    receivedReviews: true,
                                    workerFavorites: true,
                                },
                            },
                            workerFavorites: { where: { customerId } },
                        },
                    },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client_1.default.estimate.count({ where: { estimateRequestId } }),
        ]);
        const workerIds = estimates.map((estimate) => estimate.workerId);
        const [avgStars, confirmedEstimateCounts] = yield Promise.all([
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
        const estimatesWithData = estimates.map((estimate) => {
            var _a, _b;
            const workerId = estimate.workerId;
            const avgStar = ((_a = avgStars.find((review) => review.workerId === workerId)) === null || _a === void 0 ? void 0 : _a._avg.star) ||
                null;
            const confirmedEstimateCount = ((_b = confirmedEstimateCounts.find((estimate) => estimate.workerId === workerId)) === null || _b === void 0 ? void 0 : _b._count._all) || 0;
            return Object.assign(Object.assign({}, estimate), { worker: Object.assign(Object.assign({}, estimate.worker), { avgStar,
                    confirmedEstimateCount }) });
        });
        return { estimatesWithData, totalCount };
    }
    catch (e) {
        throw e;
    }
});
const getEstimateByEstimatetId = (estimatetId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estimate = yield client_1.default.estimate.findFirst({
            where: { id: estimatetId },
        });
        if (!estimate)
            throw new Error("400/Estimate not found");
        return estimate;
    }
    catch (e) {
        throw e;
    }
});
const getAssignedEstimate = (workerId, isConfirmed, serviceType, serviceArea, search) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const where = Object.assign(Object.assign(Object.assign(Object.assign({ workerId, status: "assigned" }, (typeof isConfirmed === "boolean" && { isConfirmed })), (serviceType &&
            serviceType.length > 0 && {
            serviceType: { in: serviceType },
        })), (serviceArea &&
            serviceArea.length > 0 && {
            departureArea: { in: serviceArea },
        })), (search && {
            customer: {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        }));
        const estimates = yield client_1.default.estimate.findMany({
            where,
            include: { customer: { select: { name: true } } },
        });
        if (!estimates)
            throw new Error("400/estimates not found");
        return estimates;
    }
    catch (e) {
        throw e;
    }
});
const getSentEstimates = (_a) => __awaiter(void 0, [_a], void 0, function* ({ workerId, page, pageSize, }) {
    try {
        const [estimates, totalCount] = yield Promise.all([
            client_1.default.estimate.findMany({
                where: { workerId, NOT: { status: "rejected", price: null } },
                include: { customer: { select: { name: true } } },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client_1.default.estimate.count({
                where: { workerId, NOT: { status: "rejected", price: null } },
            }),
        ]);
        if (!estimates)
            throw new Error("400/estimates not found");
        return { estimates, totalCount };
    }
    catch (e) {
        throw e;
    }
});
const getRejectEstimates = (_a) => __awaiter(void 0, [_a], void 0, function* ({ workerId, page, pageSize, }) {
    try {
        const [estimates, totalCount] = yield Promise.all([
            client_1.default.estimate.findMany({
                where: { workerId, status: "rejected" },
                include: { customer: { select: { name: true } } },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client_1.default.estimate.count({ where: { workerId, status: "rejected" } }),
        ]);
        if (!estimates)
            throw new Error("400/estimates not found");
        return { estimates, totalCount };
    }
    catch (e) {
        throw e;
    }
});
const getReviewableEstimates = (_a) => __awaiter(void 0, [_a], void 0, function* ({ customerId, page, pageSize, }) {
    try {
        const [estimates, totalCount] = yield Promise.all([
            client_1.default.estimate.findMany({
                where: {
                    customerId,
                    isConfirmed: true,
                    movingDate: { lt: new Date() },
                    review: null,
                },
                select: {
                    id: true,
                    workerId: true,
                    serviceType: true,
                    movingDate: true,
                    departureAddress: true,
                    destination: true,
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
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client_1.default.estimate.count({
                where: {
                    customerId,
                    isConfirmed: true,
                    movingDate: { lt: new Date() },
                    review: null,
                },
            }),
        ]);
        return {
            estimates,
            totalCount,
        };
    }
    catch (e) {
        throw e;
    }
});
const getworkerIdByEstimateId = (estimateId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estimate = yield client_1.default.estimate.findFirst({
            where: { id: estimateId },
            select: { workerId: true },
        });
        if (!(estimate === null || estimate === void 0 ? void 0 : estimate.workerId))
            throw new Error("400/worker not found");
        return estimate.workerId;
    }
    catch (e) {
        throw e;
    }
});
// 기사-유저간의 존재하는 견적 가져오기 함수
const findEstimate = (estimateId, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const where = { id: estimateId };
        if (status) {
            where.status = status;
        }
        const estimate = yield client_1.default.estimate.findFirst({
            where,
        });
        if (!estimate)
            throw new Error(`400/${status ? status : ""} Estimate not found`);
        return estimate;
    }
    catch (e) {
        throw e;
    }
});
const estimateService = {
    createEstimate,
    confirmEstimate,
    rejectEstimate,
    priceEstimate,
    getPendingEstimates,
    getEstimatesByEstimateRequestId,
    getEstimateByEstimatetId,
    getAssignedEstimate,
    getSentEstimates,
    getRejectEstimates,
    getReviewableEstimates,
    getworkerIdByEstimateId,
    findEstimate,
};
exports.default = estimateService;
