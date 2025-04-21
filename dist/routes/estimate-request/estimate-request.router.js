"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const estimate_request_controller_1 = __importDefault(require("../../controllers/estimate-request.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const estimate_requset_validation_1 = require("../../validations/estimate-requset.validation");
const common_validation_1 = require("../../validations/common.validation");
const estimateRequstRouter = express_1.default.Router();
estimateRequstRouter.use(auth_middleware_1.authenticatedOnly);
// 일반 유저가 견적 요청하기 생성
estimateRequstRouter.post("/", auth_middleware_1.customerOnly, estimate_requset_validation_1.validateEstimateRequset, estimate_request_controller_1.default.createEstimateRequestController);
// 일반 유저가 견적 요청하기 삭제
estimateRequstRouter.delete("/", auth_middleware_1.customerOnly, estimate_request_controller_1.default.deleteEstimateRequestController);
//받았던 견적페이지에서 내가 보낸 견적 요청 정보들
estimateRequstRouter.get("/", auth_middleware_1.customerOnly, common_validation_1.validatePaginationQuery, estimate_request_controller_1.default.getEstimateRequestsController);
//기사 유저가 받은 요청 -> 지정 견적 + 견적 요청 +필터 기능 까지.
estimateRequstRouter.get("/received", auth_middleware_1.workerOnly, estimate_requset_validation_1.validateEstimateRequsetQuery, estimate_request_controller_1.default.getRequsetEstimateRequestsController);
exports.default = estimateRequstRouter;
