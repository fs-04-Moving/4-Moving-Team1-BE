import express from "express";
import {
  authenticatedOnly,
  workerOnly,
} from "../../../middleware/auth.middleware";
import estimate from "../../../controllers/estimate.controller";
import { validatePaginationQuery } from "../../../validations/common.validation";

const workerEstimateRouter = express.Router();

workerEstimateRouter.use(authenticatedOnly);

//견적 생성하기
workerEstimateRouter.post(
  "/general/:customerId",
  workerOnly,
  estimate.createGeneralEstimateController
);
// 견적 거부하기
workerEstimateRouter.put(
  "/reject/:estimateId",
  workerOnly,
  estimate.rejectEstimateController
);
// 견적 가격 보내기
workerEstimateRouter.put(
  "/price/:estimateId",
  workerOnly,
  estimate.priceEstimateController
);
//상세보기
workerEstimateRouter.get(
  "/worker/detail/:estimateId",
  workerOnly,
  estimate.getEstimateDetailByWorkerController
);
//보낸 견적보기
workerEstimateRouter.get(
  "/sent",
  validatePaginationQuery,
  workerOnly,
  estimate.getSentEstimatesController
);
//반려한 견적보기
workerEstimateRouter.get(
  "/reject",
  validatePaginationQuery,
  workerOnly,
  estimate.getRejectEstimatesController
);

export default workerEstimateRouter;
