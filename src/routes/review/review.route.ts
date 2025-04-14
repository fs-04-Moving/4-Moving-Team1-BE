import express from "express";
import {
  authenticatedOnly,
  customerOnly,
} from "../../middleware/auth.middleware";
import review from "../../controllers/review.controller";
import { validatePaginationQuery } from "../../validations/common.validation";

const reviewRouter = express.Router();

reviewRouter.post(
  "/:estimateId",
  authenticatedOnly,
  customerOnly,
  review.createReviewController
);

reviewRouter.get(
  "/",
  authenticatedOnly,
  customerOnly,
  validatePaginationQuery,
  review.getMyReviewController
);

reviewRouter.get(
  "/:workerId",
  validatePaginationQuery,
  review.getWorkerReviewsController
);

export default reviewRouter;
