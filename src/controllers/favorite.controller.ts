import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import favoriteService from "../services/favorite.service";
import { PaginationQuery } from "../validations/common.validation";
import { BASE_URL } from "../app";
import userService from "../services/user.service";

const createFavoriteController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { workerId } = req.params;
    await favoriteService.createFavorite(customerId, workerId);
    res.sendStatus(201);
  }
);

const deleteFavoriteController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { workerId } = req.params;
    await favoriteService.deleteFavorite(customerId, workerId);
    res.sendStatus(204);
  }
);

const getFavoriteWorkersController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const { favoriteWorkersWithData, totalCount } =
      await favoriteService.getFavoriteWorkers({
        customerId,
        page,
        pageSize,
      });
    const list = favoriteWorkersWithData
      .filter((fav) => fav.worker?.workProfile)
      .map((fav) => {
        const profile = fav.worker.workProfile!;
        return {
          id: fav.workerId,
          profileImage: profile.profileImage
            ? `${BASE_URL}/static/${profile.profileImage.split("/").pop()}`
            : null,
          nickname: profile.nickname,
          experience: profile.experience,
          summary: profile.summary,
          description: profile.description,
          services: profile.services,
          serviceAreas: profile.serviceAreas,
          confirmedEstimatesCount: fav.worker.confirmedEstimatesCount,
          reviewsCount: fav.worker._count.receivedReviews,
          favoritesCount: fav.worker._count.workerFavorites,
          reviewsAverage: fav.worker.avgStar,
          isFavorite: true,
        };
      });

    res.send({ list, totalCount }).status(200);
  }
);

const checkFavoriteController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { workerId } = req.params;
    await userService.findUser(workerId);
    const result = await favoriteService.checkFavorite({
      customerId,
      workerId,
    });
    res.status(200).send(result);
  }
);

const favorite = {
  createFavoriteController,
  deleteFavoriteController,
  getFavoriteWorkersController,
  checkFavoriteController,
};
export default favorite;
