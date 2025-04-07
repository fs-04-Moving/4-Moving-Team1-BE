import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { ReviewDto } from "../types/review.type";
import { findEstimate } from "../servieces/utills";
import estimateService from "../servieces/estimate.service";
import reviewService from "../servieces/review.serivce";

const createReviewController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateId } = req.params as { estimateId: string };
    const customerId = req.userId as string;
    const { content, star } = req.body;

    const workerId = await estimateService.getworkerIdByEstimateId(estimateId);
    const reviewDto: ReviewDto = {
      content,
      star,
      estimateId,
      workerId,
      customerId,
    };
    await reviewService.createReview(reviewDto);
    res.sendStatus(201);
  }
);

const review = { createReviewController };

export default review;
