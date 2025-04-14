import express from "express";
import {
  authenticatedOnly,
  customerOnly,
} from "../../../middleware/auth.middleware";
import estimate from "../../../controllers/estimate.controller";
import { validatePaginationQuery } from "../../../validations/common.validation";

const customerEstimateRouter = express.Router();

customerEstimateRouter.use(authenticatedOnly);

//지정 견적 생성하기
customerEstimateRouter.post(
  "/assigned/:workerId",
  customerOnly,
  estimate.createAssignedEstimateController
);

//견적 확정하기
customerEstimateRouter.put(
  "/confirm/:estimateId",
  customerOnly,
  estimate.confirmEstimateController
);

//대기중인 견적 보기
customerEstimateRouter.get(
  "/pending",
  validatePaginationQuery,
  customerOnly,
  estimate.getPendingEstimatesController
);
//견적 상세보기
customerEstimateRouter.get(
  "/customer/detail/:estimateId",
  customerOnly,
  estimate.getEstimateDetailByCustomerController
);
//리뷰 가능한 견적 보기
customerEstimateRouter.get(
  "/reviewable",
  validatePaginationQuery,
  customerOnly,
  estimate.getReviewableEstimatesController
);

//받은 견적들 get
customerEstimateRouter.get(
  "/received/:estimateRequestId",
  authenticatedOnly,
  validatePaginationQuery,
  customerOnly,
  estimate.getEstimatesController
);

export default customerEstimateRouter;
