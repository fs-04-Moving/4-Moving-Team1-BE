import express from "express";
import estimateRequest from "../controllers/estimate-request.controller";
import { authenticatedOnly, customerOnly } from "../middleware/auth.middleware";
import { validateEstimateRequset } from "../vaildataions/estimate-requset.validation";

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

export default estimateRequstRouter;
