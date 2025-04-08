import express from "express";
import { authenticatedOnly, customerOnly } from "../middleware/auth.middleware";
import review from "../controllers/review.controller";
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
  review.getMyReviewController
);

export default reviewRouter;
