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

const getMyReview = async ({
  customerId,
  page,
  pageSize,
}: {
  customerId: string;
  page: number;
  pageSize: number;
}) => {
  try {
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { customerId },
        include: {
          estimate: {
            select: {
              serviceType: true,
              movingDate: true,
              price: true,
              status: true,
              worker: {
                select: {
                  workProfile: {
                    select: {
                      nickname: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where: { customerId } }),
    ]);

    return { reviews, totalCount };
  } catch (e) {
    throw e;
  }
};

const reviewService = { createReview, getMyReview };
export default reviewService;
