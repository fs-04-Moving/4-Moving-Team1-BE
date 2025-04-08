import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { ReviewDto } from "../types/review.type";
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

const getMyReviewController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const reviews = await reviewService.getMyReview(customerId);

    const data = reviews.map((review) => ({
      id: review.id,
      workerId: review.workerId,
      customerId: review.customerId,
      star: review.star,
      createdAt: review.createdAt,
      content: review.content,
      estimateId: review.estimateId,
      serviceType: review.estimate?.serviceType,
      movingDate: review.estimate?.movingDate,
      price: review.estimate?.price,
      status: review.estimate?.status,
      workerNickname: review.estimate?.worker?.workProfile?.nickname,
    }));

    res.status(200).send(data);
  }
);

const review = { createReviewController, getMyReviewController };

export default review;
