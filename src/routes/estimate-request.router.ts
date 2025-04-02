import express from "express";
import estimateRequst from "../controllers/estimate-request.controller";
import { authenticatedOnly, customerOnly } from "../middleware/auth.middleware";

const estimateRequstRouter = express.Router();

estimateRequstRouter.post(
  "/",
  authenticatedOnly,
  customerOnly,
  estimateRequst.createEstimateRequestController
);

export default estimateRequstRouter;
