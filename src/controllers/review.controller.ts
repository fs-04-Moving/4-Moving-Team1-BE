import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { ReviewDto } from "../types/review.type";
import estimateService from "../servieces/estimate.service";
import reviewService from "../servieces/review.serivce";
import { PaginationQuery } from "../validations/common.validation";

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
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const { reviews, totalCount } = await reviewService.getMyReview({
      customerId,
      page,
      pageSize,
    });

    const list = reviews.map((review) => ({
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

    res.status(200).send({ list, totalCount });
  }
);

const getWorkerReviewsController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { workerId } = req.params as { workerId: string };
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const result = await reviewService.getWorkerReviews({
      workerId,
      page,
      pageSize,
    });
    res.send(result).status(200);
  }
);

const review = {
  createReviewController,
  getMyReviewController,
  getWorkerReviewsController,
};

export default review;
