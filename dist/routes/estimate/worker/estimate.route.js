"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const estimate_controller_1 = __importDefault(require("../../../controllers/estimate.controller"));
const common_validation_1 = require("../../../validations/common.validation");
const workerEstimateRouter = express_1.default.Router();
workerEstimateRouter.use(auth_middleware_1.authenticatedOnly);
//견적 생성하기
workerEstimateRouter.post("/general/:customerId", auth_middleware_1.workerOnly, estimate_controller_1.default.createGeneralEstimateController);
// 견적 거부하기
workerEstimateRouter.put("/reject/:estimateId", auth_middleware_1.workerOnly, estimate_controller_1.default.rejectEstimateController);
// 견적 가격 보내기
workerEstimateRouter.put("/price/:estimateId", auth_middleware_1.workerOnly, estimate_controller_1.default.priceEstimateController);
//상세보기
workerEstimateRouter.get("/worker/detail/:estimateId", auth_middleware_1.workerOnly, estimate_controller_1.default.getEstimateDetailByWorkerController);
//보낸 견적보기
workerEstimateRouter.get("/sent", common_validation_1.validatePaginationQuery, auth_middleware_1.workerOnly, estimate_controller_1.default.getSentEstimatesController);
//반려한 견적보기
workerEstimateRouter.get("/reject", common_validation_1.validatePaginationQuery, auth_middleware_1.workerOnly, estimate_controller_1.default.getRejectEstimatesController);
exports.default = workerEstimateRouter;
