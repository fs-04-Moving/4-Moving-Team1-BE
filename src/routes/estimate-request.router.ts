import express from "express";
import estimateRequest from "../controllers/estimate-request.controller";
import { authenticatedOnly, customerOnly } from "../middleware/auth.middleware";
import { validateEstimateRequset } from "../vaildataions/estimate-requset.validation";

const estimateRequstRouter = express.Router();

estimateRequstRouter.post(
  "/",
  authenticatedOnly,
  customerOnly,
  validateEstimateRequset,
  estimateRequest.createEstimateRequestController
);

estimateRequstRouter.delete(
  "/",
  authenticatedOnly,
  customerOnly,
  estimateRequest.deleteEstimateRequestController
);

export default estimateRequstRouter;
