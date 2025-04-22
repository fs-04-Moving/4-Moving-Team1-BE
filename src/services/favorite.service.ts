import prisma from "../db/prisma/client";

const createFavorite = async (customerId: string, workerId: string) => {
  try {
    const worker = await prisma.user.findFirst({
      where: { id: workerId },
      select: { id: true },
    });
    if (!worker) throw new Error("400/invalid worker id");
    const customer = await prisma.user.findFirst({
      where: { id: workerId },
      select: { id: true },
    });
    if (!customer) throw new Error("400/invalid customer id");
    const existFavorite = await prisma.favorite.findFirst({
      where: { customerId, workerId },
    });
    if (existFavorite) {
      throw new Error("400/favorite already exist");
    }
    await prisma.favorite.create({
      data: { workerId, customerId },
    });
  } catch (e) {
    throw e;
  }
};

const deleteFavorite = async (customerId: string, workerId: string) => {
  try {
    const worker = await prisma.user.findFirst({
      where: { id: workerId },
      select: { id: true },
    });
    if (!worker) throw new Error("400/invalid worker id");
    const customer = await prisma.user.findFirst({
      where: { id: workerId },
      select: { id: true },
    });
    if (!customer) throw new Error("400/invalid customer id");

    const existFavorite = await prisma.favorite.findFirst({
      where: { customerId, workerId },
    });
    if (!existFavorite) {
      throw new Error("400/favorite not exist");
    }
    await prisma.favorite.delete({
      where: { customerId_workerId: { customerId, workerId } },
    });
  } catch (e) {
    throw e;
  }
};
const getFavoriteWorkers = async ({
  customerId,
  page,
  pageSize,
}: {
  customerId: string;
  page: number;
  pageSize: number;
}) => {
  try {
    const now = new Date();
    const [favoriteWorkers, totalCount] = await Promise.all([
      prisma.favorite.findMany({
        where: { customerId },
        include: {
          worker: {
            select: {
              id: true,
              workProfile: true,
              _count: {
                select: {
                  receivedReviews: true,
                  workerFavorites: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.favorite.count({
        where: { customerId },
      }),
    ]);

    const workerIds = favoriteWorkers.map((fav) => fav.worker.id);

    const [avgStars, confirmedEstimatesCounts] = await Promise.all([
      prisma.review.groupBy({
        by: ["workerId"],
        where: { workerId: { in: workerIds } },
        _avg: { star: true },
      }),
      prisma.estimate.groupBy({
        by: ["workerId"],
        where: {
          workerId: { in: workerIds },
          isConfirmed: true,
          movingDate: { lt: now },
        },
        _count: { _all: true },
      }),
    ]);

    const favoriteWorkersWithData = favoriteWorkers.map((fav) => {
      const workerId = fav.worker.id;
      const avgStar =
        avgStars.find((review) => review.workerId === workerId)?._avg.star ||
        null;
      const confirmedEstimatesCount =
        confirmedEstimatesCounts.find(
          (estimate) => estimate.workerId === workerId
        )?._count._all || 0;

      return {
        ...fav,
        worker: {
          ...fav.worker,
          avgStar,
          confirmedEstimatesCount,
        },
      };
    });

    return { favoriteWorkersWithData, totalCount };
  } catch (e) {
    throw e;
  }
};

const checkFavorite = async ({
  customerId,
  workerId,
}: {
  customerId: string | undefined;
  workerId: string;
}) => {
  try {
    if (!customerId) return false;

    const existFavorite = await prisma.favorite.findFirst({
      where: { customerId, workerId },
    });
    return !!existFavorite;
  } catch (e) {
    throw e;
  }
};

const favoriteService = {
  createFavorite,
  deleteFavorite,
  getFavoriteWorkers,
  checkFavorite,
};

export default favoriteService;
