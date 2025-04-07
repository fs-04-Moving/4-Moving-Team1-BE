import express from "express";
import estimateRequest from "../controllers/estimate-request.controller";
import {
  authenticatedOnly,
  customerOnly,
  workerOnly,
} from "../middleware/auth.middleware";
import { validateEstimateRequset } from "../vaildataions/estimate-requset.validation";
import { workerData } from "worker_threads";

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

//받았던 견적페이지에서 내가 보낸 견적적 요청 정보들
estimateRequstRouter.get(
  "/",
  authenticatedOnly,
  customerOnly,
  estimateRequest.getEstimateRequestsController
);

estimateRequstRouter.get(
  "/received",
  authenticatedOnly,
  workerOnly,
  estimateRequest.getRequsetEstimateRequestsController
);

export default estimateRequstRouter;
