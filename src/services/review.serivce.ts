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
                      profileImage: true,
                    },
                  },
                },
              },
            },
          },
          customer: { select: { email: true } },
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

const getWorkerReviews = async ({
  page,
  pageSize,
  workerId,
}: {
  page: number;
  pageSize: number;
  workerId: string;
}) => {
  const [reviews, group, avgStar] = await Promise.all([
    prisma.review.findMany({
      where: { workerId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { email: true } } },
    }),
    prisma.review.groupBy({
      by: ["star"],
      where: { workerId },
      _count: true,
    }),
    prisma.review.aggregate({
      where: { workerId },
      _avg: { star: true },
    }),
  ]);

  const formattedReviews = reviews.map((review) => ({
    ...review,
    customerEmail: review.customer.email,
    customer: undefined,
  }));

  const starCountList = [0, 0, 0, 0, 0];
  group.forEach((item) => {
    const star = item.star;
    starCountList[star - 1] = item._count;
  });

  const totalCount = starCountList.reduce((a, b) => {
    return a + b;
  }, 0);

  return {
    list: formattedReviews,
    starCountList,
    totalCount,
    rating: avgStar._avg.star,
  };
};

const reviewService = { createReview, getMyReview, getWorkerReviews };
export default reviewService;
