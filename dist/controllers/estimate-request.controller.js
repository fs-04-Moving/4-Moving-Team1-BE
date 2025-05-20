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
const estimate_request_sevice_1 = __importDefault(require("../services/estimate-request.sevice"));
const profile_service_1 = __importDefault(require("../services/profile.service"));
const user_service_1 = __importDefault(require("../services/user.service"));
// 견적 요청 생성하기
const createEstimateRequestController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceType, departure, destination, movingDate, departureArea } = req.body;
    const customerId = req.userId;
    const estimateRequstDto = {
        customerId,
        serviceType,
        departure,
        destination,
        movingDate,
        departureArea,
    };
    // await 서비스 함수 호출
    yield estimate_request_sevice_1.default.createEstimateRequest(estimateRequstDto);
    const { accessToken, refreshToken } = yield user_service_1.default.updateUserRequestStatus(customerId);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        domain: ".movings.kro.kr",
    });
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        domain: ".movings.kro.kr",
    });
    res.status(200).send({ accessToken });
}));
// 견적 요청 삭제하기
const deleteEstimateRequestController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    yield estimate_request_sevice_1.default.deleteEstimateRequest(customerId);
    res.sendStatus(204);
}));
// 일반 유저 받았던 견적 요청들
const getEstimateRequestsController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.userId;
    const { page, pageSize } = req.validateQuery;
    const { inactiveEstimateRequests, totalCount } = yield estimate_request_sevice_1.default.findInactiveEstimateRequests({
        customerId,
        page,
        pageSize,
    });
    const estimateRequests = yield Promise.all(inactiveEstimateRequests.map((inactiveEstimateRequest) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, createdAt, serviceType, movingDate, departure, destination, } = inactiveEstimateRequest;
        return {
            id,
            requestDate: createdAt,
            serviceType,
            movingDate,
            destination,
            departure,
        };
    })));
    res.status(200).send({ list: estimateRequests, totalCount });
}));
//1.모든 estimateReuest를 가져온다.
//2.estimateReuest include estimate (estimate.workerId === estimateRequest.workId) 인게 있는지 확인한다.
//3.2에서 있다면 status가 assigned 를 응답값에 추가 없으면 null 추가
const getRequsetEstimateRequestsController = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = req.userId;
    const { orderBy, serviceType, filter, search, page, pageSize } = req.validateQuery;
    const isAssigned = filter === null || filter === void 0 ? void 0 : filter.includes("assigned");
    const isServiceable = filter === null || filter === void 0 ? void 0 : filter.includes("area");
    let serviceArea = undefined;
    if (isServiceable) {
        serviceArea = yield profile_service_1.default.getWorkerServiceArea(workerId);
    }
    const data = yield estimate_request_sevice_1.default.getRecivedEstimateReuests({
        page,
        pageSize,
        workerId,
        orderBy,
        serviceType,
        serviceArea,
        search,
        isAssigned,
    });
    serviceArea = yield profile_service_1.default.getWorkerServiceArea(workerId);
    const count = yield estimate_request_sevice_1.default.countEstimateRequests({
        serviceArea,
        workerId,
    });
    res.status(200).send(Object.assign(Object.assign({}, data), count));
}));
const estimateRequest = {
    createEstimateRequestController,
    deleteEstimateRequestController,
    getEstimateRequestsController,
    getRequsetEstimateRequestsController,
};
exports.default = estimateRequest;
