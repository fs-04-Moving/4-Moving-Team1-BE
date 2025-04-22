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
// 견적 요청 생성 함수
const createEstimateRequest = (estimateRequstDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = estimateRequstDto;
        const existingEstimateRequest = yield client_1.default.estimateRequest.findFirst({
            where: {
                customerId,
                OR: [{ status: "active" }, { status: "confirmed" }],
            },
        });
        if (existingEstimateRequest) {
            throw new Error("400/active estimateRequest exist");
        }
        yield client_1.default.estimateRequest.create({
            data: Object.assign({}, estimateRequstDto),
        });
    }
    catch (e) {
        throw e;
    }
});
// 견적 요청 삭제 함수
const deleteEstimateRequest = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estimateRequest = yield client_1.default.estimateRequest.findFirst({
            where: {
                customerId,
                status: "active",
            },
        });
        if (!estimateRequest) {
            throw new Error("400/estimateRequest not found");
        }
        yield client_1.default.estimateRequest.deleteMany({
            where: {
                customerId,
                status: "active",
            },
        });
    }
    catch (e) {
        throw e;
    }
});
// 견적 요청의 상태를 confirm으로 변경하는함수
const confirmEstimateRequest = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: estimateRequestId } = yield findActiveEstimateRequest(customerId);
    yield client_1.default.estimateRequest.update({
        where: { id: estimateRequestId },
        data: { status: "confirmed" },
    });
});
const getRecivedEstimateReuests = (_a) => __awaiter(void 0, [_a], void 0, function* ({ workerId, page = 1, pageSize = 10, serviceType, serviceArea, search, orderBy = "earliestRequest", isAssigned = false, }) {
    const where = Object.assign(Object.assign(Object.assign(Object.assign({ status: "active" }, ((serviceType === null || serviceType === void 0 ? void 0 : serviceType.length) && { serviceType: { in: serviceType } })), ((serviceArea === null || serviceArea === void 0 ? void 0 : serviceArea.length) && { departureArea: { in: serviceArea } })), (search && {
        user: {
            name: {
                contains: search,
                mode: "insensitive",
            },
        },
    })), (isAssigned && {
        estimates: {
            some: {
                workerId,
                status: "assigned",
            },
        },
    }));
    const orderByField = orderBy === "earliestMove" ? { movingDate: "asc" } : { createdAt: "asc" };
    const requests = yield client_1.default.estimateRequest.findMany({
        where,
        include: {
            estimates: {
                where: { workerId, status: "assigned" },
                take: 1,
            },
            user: true,
        },
        orderBy: orderByField,
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    const formatted = requests.map((r) => {
        var _a, _b;
        console.log(r.estimates);
        return {
            id: r.id,
            customerId: r.customerId,
            serviceType: r.serviceType,
            movingDate: r.movingDate,
            departure: r.departure,
            destination: r.destination,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            customerName: r.user.name,
            status: r.estimates.length !== 0 ? "assigned" : null,
            estimateId: (_b = (_a = r.estimates[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
        };
    });
    const totalCount = yield client_1.default.estimateRequest.count({ where });
    return {
        list: formatted,
        totalCount,
    };
});
const findInactiveEstimateRequests = (_a) => __awaiter(void 0, [_a], void 0, function* ({ customerId, page, pageSize, }) {
    try {
        const [inactiveEstimateRequests, totalCount] = yield Promise.all([
            client_1.default.estimateRequest.findMany({
                where: { customerId, status: "inactive" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client_1.default.estimateRequest.count({
                where: { customerId, status: "inactive" },
            }),
        ]);
        if (!inactiveEstimateRequests)
            throw new Error("400/acitve Estimate Request not found");
        return { inactiveEstimateRequests, totalCount };
    }
    catch (e) {
        throw e;
    }
});
const findActiveEstimateRequest = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estimateRequest = yield client_1.default.estimateRequest.findFirst({
            where: { customerId, status: "active" },
        });
        if (!estimateRequest)
            throw new Error("400/acitve Estimate Request not found");
        return estimateRequest;
    }
    catch (e) {
        throw e;
    }
});
const estimateRequstService = {
    createEstimateRequest,
    deleteEstimateRequest,
    confirmEstimateRequest,
    getRecivedEstimateReuests,
    findInactiveEstimateRequests,
    findActiveEstimateRequest,
};
exports.default = estimateRequstService;
