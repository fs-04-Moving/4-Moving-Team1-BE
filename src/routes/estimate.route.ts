import express from "express";
import estimate from "../controllers/estimate.controller";
import {
  authenticatedOnly,
  customerOnly,
  workerOnly,
} from "../middleware/auth.middleware";
import { validatePaginationQuery } from "../validations/common.validation";

const estimateRouter = express.Router();

// 일반 유저가 지정견적 생성하기
estimateRouter.post(
  "/assigned/:workerId",
  authenticatedOnly,
  customerOnly,
  estimate.createAssignedEstimateController
);

// 일반 유저가 기사가 보낸 견적 확정하기
estimateRouter.put(
  "/confirm/:estimateId",
  authenticatedOnly,
  customerOnly,
  estimate.confirmEstimateController
);

// 기사 유저가 일반 견적 생성하기
estimateRouter.post(
  "/general/:customerId",
  authenticatedOnly,
  workerOnly,
  estimate.createGeneralEstimateController
);

//기사 유저가 지정 견적 거절하기
estimateRouter.put(
  "/reject/:estimateId",
  authenticatedOnly,
  workerOnly,
  estimate.rejectEstimateController
);

//기사 유저가 지정 견적 가격 설정하기
estimateRouter.put(
  "/price/:estimateId",
  authenticatedOnly,
  workerOnly,
  estimate.priceEstimateController
);

//일반 유저 대기중인 견적 get
estimateRouter.get(
  "/pending",
  authenticatedOnly,
  customerOnly,
  validatePaginationQuery,
  estimate.getPendingEstimatesController
);

//받은 견적들 get
estimateRouter.get(
  "/received/:estimateRequestId",
  authenticatedOnly,
  validatePaginationQuery,
  estimate.getEstimatesController
);

//상세 견적 가져오기
estimateRouter.get(
  "/detail/:estimateId",
  authenticatedOnly,
  estimate.getEstimateDetailController
);

//보낸 견적 조회
estimateRouter.get(
  "/sent",
  authenticatedOnly,
  workerOnly,
  validatePaginationQuery,
  estimate.getSentEstimatesController
);
// 반려한 요청 조회
estimateRouter.get(
  "/reject",
  authenticatedOnly,
  workerOnly,
  validatePaginationQuery,
  estimate.getRejectEstimatesController
);

// 리뷰 가능한 견적들
estimateRouter.get(
  "/reviewable",
  authenticatedOnly,
  customerOnly,
  validatePaginationQuery,
  estimate.getReviewableEstimatesController
);

export default estimateRouter;
