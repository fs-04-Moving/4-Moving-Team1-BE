import prisma from "../db/prisma/client";
import { ReviewDto } from "../types/review.type";

const createReview = async (reviewDto: ReviewDto) => {
  try {
    const { estimateId } = reviewDto;

    const existReview = await prisma.review.findFirst({
      where: { estimateId },
    });

    if (existReview) throw new Error("400/Review already exist");

    await prisma.review.create({
      data: reviewDto,
    });
  } catch (e) {
    throw e;
  }
};

const reviewService = { createReview };
export default reviewService;
