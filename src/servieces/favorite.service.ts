import prisma from "../db/prisma/client";

const createFavorite = async (customerId: string, workerId: string) => {
  try {
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
const getFavorites = async (customerId: string) => {
  try {
    const FavoriteWorkers = await prisma.favorite.findMany({
      where: { customerId },
      include: { worker: { select: { workProfile: true } } },
    });
    return FavoriteWorkers;
  } catch (e) {
    throw e;
  }
};

const favoriteService = { createFavorite, deleteFavorite, getFavorites };

export default favoriteService;
