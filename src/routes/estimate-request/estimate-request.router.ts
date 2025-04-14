import express from "express";
import estimateRequest from "../../controllers/estimate-request.controller";
import {
  authenticatedOnly,
  customerOnly,
  workerOnly,
} from "../../middleware/auth.middleware";
import {
  validateEstimateRequset,
  validateEstimateRequsetQuery,
} from "../../validations/estimate-requset.validation";
import { validatePaginationQuery } from "../../validations/common.validation";

const estimateRequstRouter = express.Router();

// 일반 유저가 견적 요청하기 생성
estimateRequstRouter.post(
  "/",
  authenticatedOnly,
  customerOnly,
  validateEstimateRequset,
  estimateRequest.createEstimateRequestController
);

// 일반 유저가 견적 요청하기 삭제
estimateRequstRouter.delete(
  "/",
  authenticatedOnly,
  customerOnly,
  estimateRequest.deleteEstimateRequestController
);

//받았던 견적페이지에서 내가 보낸 견적 요청 정보들
estimateRequstRouter.get(
  "/",
  authenticatedOnly,
  customerOnly,
  validatePaginationQuery,
  estimateRequest.getEstimateRequestsController
);

//기사 유저가 받은 요청 -> 지정 견적 + 견적 요청 +필터 기능 까지.
estimateRequstRouter.get(
  "/received",
  authenticatedOnly,
  workerOnly,
  validateEstimateRequsetQuery,
  estimateRequest.getRequsetEstimateRequestsController
);

export default estimateRequstRouter;
