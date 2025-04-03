import express from "express";
import estimate from "../controllers/estimate.controller";
import {
  authenticatedOnly,
  customerOnly,
  workerOnly,
} from "../middleware/auth.middleware";

const estimateRouter = express.Router();

// 일반 유저가 지정견적 생성하기
estimateRouter.post(
  "/assinged/:workerId",
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
  estimate.PriceEstimateController
);

export default estimateRouter;
