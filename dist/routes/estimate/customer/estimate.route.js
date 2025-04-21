"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const estimate_controller_1 = __importDefault(require("../../../controllers/estimate.controller"));
const common_validation_1 = require("../../../validations/common.validation");
const customerEstimateRouter = express_1.default.Router();
customerEstimateRouter.use(auth_middleware_1.authenticatedOnly);
//지정 견적 생성하기
customerEstimateRouter.post("/assigned/:workerId", auth_middleware_1.customerOnly, estimate_controller_1.default.createAssignedEstimateController);
//견적 확정하기
customerEstimateRouter.put("/confirm/:estimateId", auth_middleware_1.customerOnly, estimate_controller_1.default.confirmEstimateController);
//대기중인 견적 보기
customerEstimateRouter.get("/pending", common_validation_1.validatePaginationQuery, auth_middleware_1.customerOnly, estimate_controller_1.default.getPendingEstimatesController);
//견적 상세보기
customerEstimateRouter.get("/customer/detail/:estimateId", auth_middleware_1.customerOnly, estimate_controller_1.default.getEstimateDetailByCustomerController);
//리뷰 가능한 견적 보기
customerEstimateRouter.get("/reviewable", common_validation_1.validatePaginationQuery, auth_middleware_1.customerOnly, estimate_controller_1.default.getReviewableEstimatesController);
//받은 견적들 get
customerEstimateRouter.get("/received/:estimateRequestId", auth_middleware_1.authenticatedOnly, common_validation_1.validatePaginationQuery, auth_middleware_1.customerOnly, estimate_controller_1.default.getEstimatesController);
exports.default = customerEstimateRouter;
