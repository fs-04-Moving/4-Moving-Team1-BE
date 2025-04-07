import prisma from "../db/prisma/client";
import { ReviewDto } from "../types/review.type";

const createReview = async (reviewDto: ReviewDto) => {
  try {
    const { star, content, customerId, estimateId } = reviewDto;
    await prisma.review.create({
      data: reviewDto,
    });
  } catch (e) {
    throw e;
  }
};
