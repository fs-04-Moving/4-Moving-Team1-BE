import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { ReviewDto } from "../types/review.type";
import { findEstimate } from "../servieces/utills";

const createReviewController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateId } = req.params as { estimateId: string };
    const customerId = req.userId as string;
    const { content, star } = req.body;
    // const reviewDto: ReviewDto = { content, star, estimateId, ,workerId,customerId };
  }
);

const review = { createReviewController };

export default review;
